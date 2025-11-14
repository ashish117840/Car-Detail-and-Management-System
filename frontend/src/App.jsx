import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/authContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingOverlay from './components/LoadingOverlay';

// Pages
import Home from './pages/Home';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import Cars from './pages/Cars';
import MyCars from './pages/MyCars';
import AddCar from './pages/AddCar';
import EditCar from './pages/EditCar';
import CarDetail from './pages/CarDetail';
import FeaturesDashboard from './pages/FeaturesDashboard';
import ServiceBooking from './pages/ServiceBooking';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Navbar />
                    <LoadingOverlay />
                    <main>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<LoginForm />} />
                            <Route path="/register" element={<RegisterForm />} />
                            <Route path="/cars" element={<Cars />} />
                            <Route
                                path="/my-cars"
                                element={
                                    <ProtectedRoute>
                                        <MyCars />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/add-car"
                                element={
                                    <ProtectedRoute>
                                        <AddCar />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/edit-car/:id"
                                element={
                                    <ProtectedRoute>
                                        <EditCar />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/cars/:id" element={<CarDetail />} />
                            <Route
                                path="/features"
                                element={
                                    <ProtectedRoute>
                                        <FeaturesDashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/services"
                                element={
                                    <ProtectedRoute>
                                        <ServiceBooking />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </main>

                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                    />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
