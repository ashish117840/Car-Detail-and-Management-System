import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../config/api';

const ServiceCostEstimator = ({ car, onClose }) => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [estimates, setEstimates] = useState({});
    const [selectedServiceType, setSelectedServiceType] = useState('');
    const [customEstimate, setCustomEstimate] = useState('');

    useEffect(() => {
        if (car) {
            fetchServices();
        }
    }, [car]);

    const fetchServices = async () => {
        try {
            const response = await api.get(`/api/services/${car._id}`);
            setServices(response.data.data);
            calculateEstimates(response.data.data);
        } catch (error) {
            console.error('Error fetching services:', error);
            setServices([]);
        } finally {
            setLoading(false);
        }
    };

    const calculateEstimates = (serviceData) => {
        const serviceTypes = ['maintenance', 'repair', 'inspection', 'detailing', 'other'];
        const estimates = {};

        serviceTypes.forEach(type => {
            const typeServices = serviceData.filter(service => service.serviceType === type);
            if (typeServices.length > 0) {
                const costs = typeServices.map(s => s.cost || 0);
                const avgCost = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;
                const minCost = Math.min(...costs);
                const maxCost = Math.max(...costs);

                estimates[type] = {
                    average: avgCost,
                    minimum: minCost,
                    maximum: maxCost,
                    count: typeServices.length,
                    lastService: typeServices.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
                };
            }
        });

        setEstimates(estimates);
    };

    const getServiceTypeIcon = (type) => {
        switch (type) {
            case 'maintenance': return '🔧';
            case 'repair': return '🛠️';
            case 'inspection': return '🔍';
            case 'detailing': return '✨';
            case 'other': return '📋';
            default: return '⚙️';
        }
    };

    const getServiceTypeColor = (type) => {
        switch (type) {
            case 'maintenance': return 'bg-blue-100 text-blue-800';
            case 'repair': return 'bg-red-100 text-red-800';
            case 'inspection': return 'bg-green-100 text-green-800';
            case 'detailing': return 'bg-purple-100 text-purple-800';
            case 'other': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getConfidenceLevel = (count) => {
        if (count >= 5) return { level: 'High', color: 'text-green-600' };
        if (count >= 3) return { level: 'Medium', color: 'text-yellow-600' };
        return { level: 'Low', color: 'text-red-600' };
    };

    const calculateCustomEstimate = () => {
        if (!selectedServiceType || !customEstimate) return null;

        const estimate = estimates[selectedServiceType];
        if (!estimate) return null;

        const customCost = parseFloat(customEstimate);
        const avgCost = estimate.average;
        const difference = Math.abs(customCost - avgCost);
        const percentageDiff = (difference / avgCost) * 100;

        return {
            customCost,
            averageCost: avgCost,
            difference,
            percentageDiff,
            isAboveAverage: customCost > avgCost
        };
    };

    const getTrendAnalysis = (type) => {
        const typeServices = services.filter(s => s.serviceType === type);
        if (typeServices.length < 2) return null;

        const sortedServices = typeServices.sort((a, b) => new Date(a.date) - new Date(b.date));
        const recentServices = sortedServices.slice(-3);
        const olderServices = sortedServices.slice(0, -3);

        if (olderServices.length === 0) return null;

        const recentAvg = recentServices.reduce((sum, s) => sum + (s.cost || 0), 0) / recentServices.length;
        const olderAvg = olderServices.reduce((sum, s) => sum + (s.cost || 0), 0) / olderServices.length;
        const trend = recentAvg - olderAvg;
        const trendPercentage = (trend / olderAvg) * 100;

        return {
            trend,
            trendPercentage,
            isIncreasing: trend > 0,
            recentAverage: recentAvg,
            olderAverage: olderAvg
        };
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-2xl p-8">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            </div>
        );
    }

    const customEstimateResult = calculateCustomEstimate();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-6xl w-full mx-4 my-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">
                        Service Cost Estimator - {car?.brand} {car?.model}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-3xl"
                    >
                        ×
                    </button>
                </div>

                {/* Service Type Estimates */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {Object.entries(estimates).map(([type, estimate]) => {
                        const confidence = getConfidenceLevel(estimate.count);
                        const trend = getTrendAnalysis(type);

                        return (
                            <div key={type} className="bg-white border border-gray-200 rounded-lg p-6">
                                <div className="flex items-center mb-4">
                                    <span className="text-2xl mr-2">{getServiceTypeIcon(type)}</span>
                                    <h3 className="text-lg font-semibold text-gray-800 capitalize">{type}</h3>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Average Cost:</span>
                                        <span className="font-semibold">${estimate.average.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Range:</span>
                                        <span className="font-semibold">
                                            ${estimate.minimum.toFixed(2)} - ${estimate.maximum.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Data Points:</span>
                                        <span className="font-semibold">{estimate.count}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Confidence:</span>
                                        <span className={`font-semibold ${confidence.color}`}>
                                            {confidence.level}
                                        </span>
                                    </div>

                                    {trend && (
                                        <div className="pt-2 border-t border-gray-200">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Trend:</span>
                                                <span className={`font-semibold ${trend.isIncreasing ? 'text-red-600' : 'text-green-600'}`}>
                                                    {trend.isIncreasing ? '↗️' : '↘️'} {Math.abs(trend.trendPercentage).toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Custom Estimate Calculator */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Custom Cost Estimate</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                            <select
                                value={selectedServiceType}
                                onChange={(e) => setSelectedServiceType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select service type...</option>
                                {Object.keys(estimates).map(type => (
                                    <option key={type} value={type} className="capitalize">
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Estimate ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={customEstimate}
                                onChange={(e) => setCustomEstimate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    {customEstimateResult && (
                        <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Estimate Analysis</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-800">
                                        ${customEstimateResult.customCost.toFixed(2)}
                                    </div>
                                    <div className="text-sm text-gray-600">Your Estimate</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        ${customEstimateResult.averageCost.toFixed(2)}
                                    </div>
                                    <div className="text-sm text-gray-600">Historical Average</div>
                                </div>
                                <div className="text-center">
                                    <div className={`text-2xl font-bold ${customEstimateResult.isAboveAverage ? 'text-red-600' : 'text-green-600'}`}>
                                        {customEstimateResult.isAboveAverage ? '+' : ''}{customEstimateResult.percentageDiff.toFixed(1)}%
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {customEstimateResult.isAboveAverage ? 'Above' : 'Below'} Average
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Analysis:</strong> Your estimate is {customEstimateResult.percentageDiff.toFixed(1)}%
                                    {customEstimateResult.isAboveAverage ? ' above' : ' below'} the historical average for this service type.
                                    {customEstimateResult.percentageDiff < 10 ? ' This is a reasonable estimate.' :
                                        customEstimateResult.percentageDiff < 25 ? ' Consider getting multiple quotes.' :
                                            ' This estimate seems significantly different from historical data.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Recommendations */}
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Cost Optimization Recommendations</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">💡 Tips to Reduce Costs</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Schedule regular maintenance to prevent major repairs</li>
                                <li>• Compare quotes from multiple service providers</li>
                                <li>• Consider seasonal timing for certain services</li>
                                <li>• Keep detailed service records for better estimates</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-800 mb-2">📊 Data Quality</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• More service records = better estimates</li>
                                <li>• Regular updates improve accuracy</li>
                                <li>• Track seasonal variations in costs</li>
                                <li>• Monitor trends over time</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-6 rounded-lg font-medium transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiceCostEstimator;
