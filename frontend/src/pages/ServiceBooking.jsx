import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../config/api';
import { useAuth } from '../context/authContext';

const defaultFormState = {
    serviceType: 'maintenance',
    date: new Date().toISOString().split('T')[0],
    cost: '',
    serviceProvider: '',
    description: ''
};

const serviceTypeOptions = [
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'repair', label: 'Repair' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'detailing', label: 'Detailing' },
    { value: 'other', label: 'Other' }
];

// Dummy service center names
const serviceCenters = [
    'AutoCare Pro Services',
    'QuickFix Auto Center',
    'Premium Car Care',
    'City Auto Service',
    'Express Auto Repair'
];

// Dummy costs for each service type
const serviceTypeCosts = {
    maintenance: 150.00,
    repair: 350.00,
    inspection: 75.00,
    detailing: 120.00,
    other: 200.00
};

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

const loadRazorpayScript = () =>
    new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });

const ServiceBooking = () => {
    const [cars, setCars] = useState([]);
    const [selectedCarId, setSelectedCarId] = useState('');
    const [services, setServices] = useState([]);
    const [loadingCars, setLoadingCars] = useState(true);
    const [loadingServices, setLoadingServices] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState(defaultFormState);
    const [customServiceProvider, setCustomServiceProvider] = useState('');
    const { user } = useAuth();

    const selectedCar = useMemo(
        () => cars.find((car) => car._id === selectedCarId),
        [cars, selectedCarId]
    );

    useEffect(() => {
        const fetchCars = async () => {
            setLoadingCars(true);
            try {
                const response = await api.get('/api/cars/my-cars');
                const list = response.data?.data || [];
                setCars(list);
                if (list.length > 0) {
                    setSelectedCarId(list[0]._id);
                }
            } catch (error) {
                console.error('Failed to load cars:', error);
                toast.error(error.response?.data?.message || 'Failed to load your cars');
            } finally {
                setLoadingCars(false);
            }
        };

        fetchCars();
    }, []);

    const fetchServices = useCallback(async () => {
        if (!selectedCarId) {
            setServices([]);
            return;
        }

        setLoadingServices(true);
        try {
            const response = await api.get(`/api/services/${selectedCarId}`);
            setServices(response.data?.data || []);
        } catch (error) {
            console.error('Failed to load services:', error);
            toast.error(error.response?.data?.message || 'Failed to load service history');
            setServices([]);
        } finally {
            setLoadingServices(false);
        }
    }, [selectedCarId]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    // Auto-populate cost when service type changes
    useEffect(() => {
        if (formData.serviceType && serviceTypeCosts[formData.serviceType]) {
            setFormData((prev) => ({
                ...prev,
                cost: serviceTypeCosts[formData.serviceType].toString()
            }));
        }
    }, [formData.serviceType]);

    const handleInputChange = (field) => (event) => {
        setFormData((prev) => ({
            ...prev,
            [field]: event.target.value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!selectedCarId) {
            toast.warn('Please select a car before booking a service');
            return;
        }

        if (!formData.cost || Number.isNaN(parseFloat(formData.cost))) {
            toast.warn('Please enter a valid service cost');
            return;
        }

        if (formData.serviceProvider === 'custom' && !customServiceProvider.trim()) {
            toast.warn('Please enter a service center name');
            return;
        }

        if (!RAZORPAY_KEY_ID) {
            toast.error('Payment gateway is not configured. Please contact support.');
            return;
        }

        setSubmitting(true);

        try {
            const scriptLoaded = await loadRazorpayScript();

            if (!scriptLoaded) {
                toast.error('Unable to load payment gateway. Please refresh and try again.');
                setSubmitting(false);
                return;
            }

            const amount = parseFloat(formData.cost);

            const orderResponse = await api.post('/api/payments/create-order', {
                amount,
                currency: 'INR',
                notes: {
                    carId: selectedCarId,
                    serviceType: formData.serviceType
                }
            });

            const order = orderResponse.data?.data;

            if (!order?.id) {
                throw new Error('Failed to initiate payment order');
            }

            const serviceDescription = `${selectedCar?.brand || 'Car'} ${selectedCar?.model || ''} - ${formData.serviceType} service`;

            const razorpayOptions = {
                key: RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: order.currency,
                name: 'Car Detail and Management System',
                description: serviceDescription,
                order_id: order.id,
                prefill: {
                    name: user?.name || '',
                    email: user?.email || ''
                },
                notes: {
                    carId: selectedCarId,
                    serviceType: formData.serviceType
                },
                theme: {
                    color: '#2563EB'
                },
                handler: async (response) => {
                    try {
                        await api.post('/api/payments/verify', {
                            orderId: response.razorpay_order_id,
                            paymentId: response.razorpay_payment_id,
                            signature: response.razorpay_signature
                        });

                        const serviceProviderValue =
                            formData.serviceProvider === 'custom'
                                ? customServiceProvider
                                : formData.serviceProvider;

                        await api.post('/api/services', {
                            ...formData,
                            serviceProvider: serviceProviderValue || '',
                            car: selectedCarId,
                            cost: amount,
                            paymentDetails: {
                                status: 'paid',
                                orderId: response.razorpay_order_id,
                                paymentId: response.razorpay_payment_id,
                                signature: response.razorpay_signature,
                                amount,
                                currency: order.currency
                            }
                        });

                        toast.success('Service booked successfully!');
                        setFormData((prev) => ({
                            ...defaultFormState,
                            date: prev.date // preserve selected date
                        }));
                        setCustomServiceProvider('');
                        await fetchServices();
                    } catch (error) {
                        console.error('Failed to record service after payment:', error);
                        toast.error(error.response?.data?.message || 'Failed to record service after payment');
                    } finally {
                        setSubmitting(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setSubmitting(false);
                        toast.info('Payment popup was closed before completion.');
                    }
                }
            };

            const razorpayCheckout = new window.Razorpay(razorpayOptions);

            razorpayCheckout.on('payment.failed', (response) => {
                console.error('Payment failed:', response.error);
                toast.error(response.error?.description || 'Payment failed. Please try again.');
                setSubmitting(false);
            });

            razorpayCheckout.open();
        } catch (error) {
            console.error('Failed to initiate payment:', error);
            toast.error(error.response?.data?.message || error.message || 'Failed to initiate payment');
            setSubmitting(false);
        }
    };

    const totalCost = services.reduce((sum, service) => sum + (service.cost || 0), 0);

    return (
        <div className="min-h-screen bg-gray-50 py-10">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Service Center</h1>
                        <p className="mt-2 text-gray-600">
                            Book maintenance, repairs, and inspections while keeping track of your past service history.
                        </p>
                    </div>
                    <Link
                        to="/my-cars"
                        className="hidden sm:inline-flex items-center px-4 py-2 border border-blue-200 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                    >
                        View My Cars
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <section className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Car</h2>

                        {loadingCars ? (
                            <div className="flex items-center space-x-3 text-gray-500">
                                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                <span>Loading your cars...</span>
                            </div>
                        ) : cars.length === 0 ? (
                            <div className="text-center text-gray-600">
                                <p>You don&apos;t have any cars yet.</p>
                                <Link
                                    to="/add-car"
                                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    Add your first car
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Choose a car to manage services
                                </label>
                                <select
                                    value={selectedCarId}
                                    onChange={(event) => setSelectedCarId(event.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {cars.map((car) => (
                                        <option key={car._id} value={car._id}>
                                            {car.brand} {car.model} ({car.year})
                                        </option>
                                    ))}
                                </select>

                                {selectedCar && (
                                    <div className="mt-4 p-4 border border-gray-200 bg-gray-50 rounded-lg space-y-2 text-sm text-gray-700">
                                        <p>
                                            <span className="font-medium">Mileage:</span>{' '}
                                            {selectedCar.mileage ? `${selectedCar.mileage.toLocaleString()} miles` : 'N/A'}
                                        </p>
                                        <p>
                                            <span className="font-medium">Owner:</span>{' '}
                                            {selectedCar.owner?.name || 'You'}
                                        </p>
                                        {selectedCar.services?.length > 0 && (
                                            <p>
                                                <span className="font-medium">Recorded services:</span>{' '}
                                                {selectedCar.services.length}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    <section className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Book a Service</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Service type</label>
                                    <select
                                        value={formData.serviceType}
                                        onChange={handleInputChange('serviceType')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {serviceTypeOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Service date</label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        max={new Date().toISOString().split('T')[0]}
                                        onChange={handleInputChange('date')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Service cost
                                        <span className="ml-1 text-xs text-gray-500 font-normal">
                                            (suggested: ${serviceTypeCosts[formData.serviceType]?.toFixed(2)})
                                        </span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.cost}
                                        onChange={handleInputChange('cost')}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Service provider
                                        <span className="ml-1 text-gray-400">(optional)</span>
                                    </label>
                                    <select
                                        value={formData.serviceProvider === 'custom' ? 'custom' : formData.serviceProvider}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === 'custom') {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    serviceProvider: 'custom'
                                                }));
                                                setCustomServiceProvider('');
                                            } else {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    serviceProvider: value
                                                }));
                                                setCustomServiceProvider('');
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="">Select a service center...</option>
                                        {serviceCenters.map((center) => (
                                            <option key={center} value={center}>
                                                {center}
                                            </option>
                                        ))}
                                        <option value="custom">Other (Enter custom name)</option>
                                    </select>
                                    {formData.serviceProvider === 'custom' && (
                                        <input
                                            type="text"
                                            value={customServiceProvider}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setCustomServiceProvider(value);
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    serviceProvider: value || 'custom'
                                                }));
                                            }}
                                            placeholder="Enter service center name"
                                            className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            autoFocus
                                        />
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Service description
                                </label>
                                <textarea
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleInputChange('description')}
                                    placeholder="Describe the work that was completed..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    type="submit"
                                    disabled={submitting || !selectedCarId}
                                    className="inline-flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg font-medium transition-colors"
                                >
                                    {submitting ? (
                                        <>
                                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
                                            Booking...
                                        </>
                                    ) : (
                                        'Book Service'
                                    )}
                                </button>
                                <p className="text-sm text-gray-500">
                                    Service records help you track maintenance and maintain resale value.
                                </p>
                            </div>
                        </form>
                    </section>
                </div>

                <section className="mt-10 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-800">Service History</h2>
                            <p className="text-gray-500">
                                Review past services and keep an eye on maintenance costs.
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Total services recorded</p>
                                <p className="text-lg font-semibold text-gray-800">{services.length}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Lifetime service spend</p>
                                <p className="text-lg font-semibold text-green-600">
                                    ${totalCost.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {!selectedCarId ? (
                        <div className="text-center py-12 text-gray-600">
                            <p>Select a car to see its service history.</p>
                        </div>
                    ) : loadingServices ? (
                        <div className="flex items-center justify-center py-12 text-gray-600">
                            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mr-3"></div>
                            <span>Loading service history...</span>
                        </div>
                    ) : services.length === 0 ? (
                        <div className="text-center py-12 text-gray-600">
                            <div className="text-4xl mb-3">🛠️</div>
                            <p>No services recorded for this car yet.</p>
                            <p className="text-sm mt-2">
                                Book a service above to start tracking maintenance history.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {services.map((service) => (
                                <article
                                    key={service._id}
                                    className="border border-gray-200 rounded-lg p-5 hover:border-blue-200 transition-colors"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 capitalize">
                                                {service.serviceType} service
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                {new Date(service.date).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-green-600">
                                                ${service.cost?.toFixed(2)}
                                            </p>
                                            {service.serviceProvider && (
                                                <p className="text-sm text-gray-500">
                                                    {service.serviceProvider}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">{service.description}</p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default ServiceBooking;

