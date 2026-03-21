import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';
import { toast } from 'react-toastify';
import CarCard from '../components/CarCard';
import { useAuth } from '../context/authContext';

const formatInr = (value) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
}).format(value || 0);

const MyCars = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchMyCars();
    }, []);

    const fetchMyCars = async () => {
        try {
            const response = await api.get('/api/cars/my-cars');
            setCars(response.data.data);
        } catch (error) {
            toast.error('Failed to fetch your cars');
            console.error('Error fetching my cars:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCar = async (carId) => {
        if (window.confirm('Are you sure you want to delete this car? This action cannot be undone.')) {
            try {
                await api.delete(`/api/cars/${carId}`);
                setCars(cars.filter(car => car._id !== carId));
                toast.success('Car deleted successfully!');
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete car');
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

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">My Cars</h1>
                    <p className="text-gray-600">
                        Manage your car inventory and service records.
                    </p>
                </div>

                {/* Add Car Button */}
                <div className="mb-6">
                    <Link
                        to="/add-car"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
                    >
                        <span className="mr-2">+</span>
                        Add New Car
                    </Link>
                </div>

                {/* Cars Grid */}
                {cars.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-md">
                        <div className="text-6xl mb-4">🚗</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No cars found</h3>
                        <p className="text-gray-600 mb-6">
                            You haven't added any cars yet. Start by adding your first car!
                        </p>
                        <Link
                            to="/add-car"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
                        >
                            <span className="mr-2">+</span>
                            Add Your First Car
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cars.map(car => (
                            <div key={car._id} className="relative">
                                <CarCard car={car} />
                                <div className="absolute top-4 right-4 flex space-x-2">
                                    <Link
                                        to={`/edit-car/${car._id}`}
                                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                                        title="Edit Car"
                                    >
                                        ✏️
                                    </Link>
                                    <button
                                        onClick={() => handleDeleteCar(car._id)}
                                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                                        title="Delete Car"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats */}
                {cars.length > 0 && (
                    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Car Statistics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{cars.length}</div>
                                <div className="text-sm text-gray-600">Total Cars</div>
                            </div>
                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                    {cars.reduce((sum, car) => sum + (car.services?.length || 0), 0)}
                                </div>
                                <div className="text-sm text-gray-600">Total Services</div>
                            </div>
                            <div className="text-center p-4 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600">
                                    {formatInr(cars.reduce((sum, car) => sum + (car.price || 0), 0))}
                                </div>
                                <div className="text-sm text-gray-600">Total Value</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyCars;
