import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../config/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/authContext';
import CarQRCode from '../components/CarQRCode';
import FuelTracker from '../components/FuelTracker';
import ServiceCostEstimator from '../components/ServiceCostEstimator';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

const CarDetail = () => {
    const [car, setCar] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showServiceForm, setShowServiceForm] = useState(false);
    const [serviceForm, setServiceForm] = useState({
        description: '',
        cost: '',
        serviceType: 'maintenance',
        serviceProvider: ''
    });
    const [showQRCode, setShowQRCode] = useState(false);
    const [showFuelTracker, setShowFuelTracker] = useState(false);
    const [showCostEstimator, setShowCostEstimator] = useState(false);
    const { id } = useParams();
    const { isAuthenticated, user } = useAuth();

    useEffect(() => {
        fetchCarDetails();
    }, [id]);

    useEffect(() => {
        if (isAuthenticated && car) {
            fetchServices();
        }
    }, [isAuthenticated, car]);

    const fetchCarDetails = async () => {
        try {
            const response = await api.get(`/api/cars/${id}`);
            setCar(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch car details');
            console.error('Error fetching car:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await api.get(`/api/services/${id}`);
            setServices(response.data.data);
        } catch (error) {
            console.error('Error fetching services:', error);
            setServices([]);
        }
    };

    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/services', {
                ...serviceForm,
                car: id,
                cost: parseFloat(serviceForm.cost),
                date: new Date()
            });

            toast.success('Service added successfully!');
            setServiceForm({
                description: '',
                cost: '',
                serviceType: 'maintenance',
                serviceProvider: ''
            });
            setShowServiceForm(false);
            fetchServices();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add service');
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (window.confirm('Are you sure you want to delete this service record?')) {
            try {
                await api.delete(`/api/services/${serviceId}`);
                toast.success('Service deleted successfully!');
                fetchServices();
            } catch (error) {
                toast.error('Failed to delete service');
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!car) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Car not found</h2>
                    <Link
                        to="/cars"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        Back to Cars
                    </Link>
                </div>
            </div>
        );
    }

    const canManageCar = isAuthenticated && (user?.role === 'admin' || car.owner?._id === user?._id);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Car Details */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            {/* Car Image */}
                            {car.image && (
                                <div className="mb-6">
                                    <img
                                        src={getImageUrl(car.image)}
                                        alt={`${car.brand} ${car.model}`}
                                        className="w-full h-64 object-cover rounded-lg"
                                        onError={handleImageError}
                                    />
                                </div>
                            )}

                            <h1 className="text-3xl font-bold text-gray-800 mb-4">
                                {car.brand} {car.model}
                            </h1>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Brand</label>
                                        <p className="text-lg font-semibold">{car.brand}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Model</label>
                                        <p className="text-lg font-semibold">{car.model}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Year</label>
                                        <p className="text-lg font-semibold">{car.year}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Price</label>
                                        <p className="text-lg font-semibold text-green-600">
                                            ${car.price?.toLocaleString()}
                                        </p>
                                    </div>
                                    {car.color && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Color</label>
                                            <p className="text-lg font-semibold capitalize">{car.color}</p>
                                        </div>
                                    )}
                                    {car.mileage && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Mileage</label>
                                            <p className="text-lg font-semibold">{car.mileage.toLocaleString()} miles</p>
                                        </div>
                                    )}
                                </div>

                                {car.description && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Description</label>
                                        <p className="text-gray-800">{car.description}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            {car.owner && (
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold mb-4">Owner Information</h3>
                                    <div className="space-y-2">
                                        <p><span className="font-medium">Name:</span> {car.owner.name}</p>
                                        <p><span className="font-medium">Email:</span> {car.owner.email}</p>
                                    </div>
                                </div>
                            )}

                            {/* Advanced Features - Available for all users */}
                            <div className="mt-6 space-y-4">
                                <button
                                    onClick={() => setShowQRCode(true)}
                                    className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                                >
                                    📱 Generate QR Code
                                </button>

                                <button
                                    onClick={() => setShowFuelTracker(true)}
                                    className="block w-full bg-yellow-600 hover:bg-yellow-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                                >
                                    ⛽ Fuel Efficiency Tracker
                                </button>

                                <button
                                    onClick={() => setShowCostEstimator(true)}
                                    className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                                >
                                    💰 Service Cost Estimator
                                </button>
                            </div>

                            {canManageCar && (
                                <div className="mt-6 space-y-4">
                                    <Link
                                        to={`/edit-car/${car._id}`}
                                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors"
                                    >
                                        Edit Car Details
                                    </Link>

                                    <button
                                        onClick={() => setShowServiceForm(!showServiceForm)}
                                        className="block w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                                    >
                                        {showServiceForm ? 'Cancel Add Service' : 'Add Service Record'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Service Form */}
                {showServiceForm && canManageCar && (
                    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Service Record</h2>

                        <form onSubmit={handleServiceSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Service Type
                                    </label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={serviceForm.serviceType}
                                        onChange={(e) => setServiceForm({ ...serviceForm, serviceType: e.target.value })}
                                    >
                                        <option value="maintenance">Maintenance</option>
                                        <option value="repair">Repair</option>
                                        <option value="inspection">Inspection</option>
                                        <option value="detailing">Detailing</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Cost
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={serviceForm.cost}
                                        onChange={(e) => setServiceForm({ ...serviceForm, cost: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Service Provider
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={serviceForm.serviceProvider}
                                        onChange={(e) => setServiceForm({ ...serviceForm, serviceProvider: e.target.value })}
                                        placeholder="e.g., Auto Shop, Dealership"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        rows="4"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={serviceForm.description}
                                        onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                                        placeholder="Describe the service performed..."
                                    />
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
                                >
                                    Add Service
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowServiceForm(false)}
                                    className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Service History */}
                {isAuthenticated && (
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Service History</h2>

                        {services.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-4xl mb-4">🔧</div>
                                <p className="text-gray-600">No service records found for this car.</p>
                                {canManageCar && (
                                    <button
                                        onClick={() => setShowServiceForm(true)}
                                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                                    >
                                        Add First Service
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {services.map(service => (
                                    <div key={service._id} className="border border-gray-200 rounded-lg p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800 capitalize">
                                                    {service.serviceType} Service
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(service.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-green-600">
                                                    ${service.cost?.toFixed(2)}
                                                </p>
                                                {canManageCar && (
                                                    <button
                                                        onClick={() => handleDeleteService(service._id)}
                                                        className="mt-2 text-red-600 hover:text-red-800 text-sm"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-gray-800 mb-2">{service.description}</p>

                                        {service.serviceProvider && (
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Provider:</span> {service.serviceProvider}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* QR Code Modal */}
                {showQRCode && car && (
                    <CarQRCode
                        car={car}
                        onClose={() => setShowQRCode(false)}
                    />
                )}

                {/* Fuel Tracker Modal */}
                {showFuelTracker && car && (
                    <FuelTracker
                        car={car}
                        onClose={() => setShowFuelTracker(false)}
                    />
                )}

                {/* Service Cost Estimator Modal */}
                {showCostEstimator && car && (
                    <ServiceCostEstimator
                        car={car}
                        onClose={() => setShowCostEstimator(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default CarDetail;
