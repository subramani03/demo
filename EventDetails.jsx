import React, { useContext, useState, useRef, useEffect } from 'react';
import upload_area from '../../assets/upload_area_dark.png';
import axios from 'axios';
import { BASE_URL } from '../../Utils/constants';
import FormContext from '../../Utils/FormContext';
import { Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

// Particle Background Component
const ParticleBackground = () => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        const generateParticles = () => {
            const newParticles = [];
            for (let i = 0; i < 50; i++) {
                newParticles.push({
                    id: i,
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    size: Math.random() * 4 + 1,
                    speedX: (Math.random() - 0.5) * 2,
                    speedY: (Math.random() - 0.5) * 2,
                });
            }
            setParticles(newParticles);
        };

        generateParticles();
        window.addEventListener('resize', generateParticles);
        return () => window.removeEventListener('resize', generateParticles);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {particles.map((particle) => (
                <motion.div
                    key={particle.id}
                    className="absolute bg-primary/20 rounded-full"
                    style={{
                        width: particle.size,
                        height: particle.size,
                    }}
                    animate={{
                        x: [particle.x, particle.x + particle.speedX * 100],
                        y: [particle.y, particle.y + particle.speedY * 100],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "linear",
                    }}
                />
            ))}
        </div>
    );
};

// Animated Background Gradients
const AnimatedBackground = () => {
    return (
        <div className="fixed inset-0 pointer-events-none">
            <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-blue-900/10 to-teal-900/10"
                animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    repeatType: "reverse",
                }}
            />
            <motion.div
                className="absolute inset-0 bg-gradient-to-tl from-pink-900/10 via-violet-900/10 to-indigo-900/10"
                animate={{
                    backgroundPosition: ['100% 100%', '0% 0%'],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    repeatType: "reverse",
                }}
            />
        </div>
    );
};

// Loading Spinner Component
const LoadingSpinner = () => (
    <motion.div
        className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
);

const EventDetails = () => {
    const { formData, setFormData, fetchEventDetails } = useContext(FormContext);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingStates, setUploadingStates] = useState({});
    const textareaRef = useRef(null);
    const controls = useAnimation();

    useEffect(() => {
        controls.start("visible");
    }, [controls]);

    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                staggerChildren: 0.1,
                ease: "easeOut"
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    const addNewEvent = () => {
        const updated = { ...formData };
        updated.events.push({
            name: '',
            date: '',
            venue: '',
            imgUrl: '',
            time: '',
            description: '',
            rules: [''],
        });
        setFormData(updated);
        setImagePreviews((prev) => [...prev, '']);
    };

    const createImageUrl = async (file) => {
        let formdata = new FormData();
        formdata.append('media', file);
        try {
            let response = await axios.post(`${BASE_URL}upload-media`, formdata, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });

            if (response.data.success) {
                return response.data.image_url;
            } else {
                console.error('Upload failed', response.data);
                return '';
            }
        } catch (err) {
            console.error('Error uploading image', err);
            return '';
        }
    };

    const handleImageChange = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingStates(prev => ({ ...prev, [index]: true }));

        const previewUrl = URL.createObjectURL(file);
        const updatedPreviews = [...imagePreviews];
        updatedPreviews[index] = previewUrl;
        setImagePreviews(updatedPreviews);

        const imageUrl = await createImageUrl(file);
        if (imageUrl) {
            const updated = { ...formData };
            updated.events[index].imgUrl = imageUrl;
            setFormData(updated);
        }

        setUploadingStates(prev => ({ ...prev, [index]: false }));
    };

    const handleEventChange = (index, field, value) => {
        const updated = { ...formData };
        updated.events[index][field] = value;
        setFormData(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            console.log(formData);
            const res = await axios.put(`${BASE_URL}updateEventDetails`, formData);
            console.log(res.data);
            toast.success(res.data, {
                position: 'top-right',
                style: {
                    backgroundColor: "#18181b",
                    color: "#ffffff",
                },
            });
        } catch (err) {
            toast.error(err.response.data, {
                position: 'top-right',
                style: {
                    backgroundColor: "#18181b",
                    color: "#ffffff",
                },
            });
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden">
            <AnimatedBackground />
            <ParticleBackground />
            
            <div className="flex items-center justify-center min-h-screen p-4 pt-20 relative z-10">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate={controls}
                    className="bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/50 p-8 rounded-3xl shadow-2xl w-full max-w-2xl"
                >
                    <motion.div 
                        variants={itemVariants}
                        className='relative'
                    >
                        <motion.button 
                            className='absolute -top-2 text-base md:text-xl w-10 h-10 font-semibold text-primary hover:text-white transition-colors duration-300 flex items-center justify-center rounded-full hover:bg-primary/20'
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Link to={'/admin/SymposiumDetails'}>
                                <i className="fa-solid fa-arrow-left"></i>
                            </Link>
                        </motion.button>
                        <motion.h3 
                            className='text-xl md:text-3xl text-primary font-bold text-center mb-12 bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent'
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            Event Details
                        </motion.h3>
                    </motion.div>

                    <AnimatePresence mode="popLayout">
                        {formData?.events?.map((element, index) => (
                            <motion.div 
                                key={index}
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.3 } }}
                                className="mb-8"
                                layout
                            >
                                <motion.div 
                                    className='p-6 rounded-2xl bg-zinc-900/50 border border-zinc-700/50 backdrop-blur-sm'
                                    whileHover={{ 
                                        boxShadow: "0 10px 30px rgba(168, 85, 247, 0.1)",
                                        borderColor: "rgba(168, 85, 247, 0.3)"
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className='flex justify-between items-center mb-6'>
                                        <motion.h3 
                                            className='text-lg md:text-xl text-primary font-bold'
                                            layoutId={`event-title-${index}`}
                                        >
                                            {`Event ${index + 1}`}
                                        </motion.h3>
                                        {formData.events.length > 1 && (
                                            <motion.button
                                                type="button"
                                                className="text-red-500 font-bold text-lg hover:text-red-300 w-8 h-8 rounded-full hover:bg-red-500/20 flex items-center justify-center transition-all duration-300"
                                                onClick={() => {
                                                    const updated = { ...formData };
                                                    updated.events.splice(index, 1);
                                                    setFormData(updated);
                                                }}
                                                whileHover={{ scale: 1.1, rotate: 90 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <i className="fa-solid fa-xmark"></i>
                                            </motion.button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Event Name */}
                                        <motion.fieldset 
                                            className="fieldset"
                                            whileFocus={{ scale: 1.02 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <legend className="fieldset-legend font-semibold mb-2 text-sm text-gray-300">Event Name</legend>
                                            <motion.input
                                                type="text"
                                                placeholder="Event Name"
                                                value={element.name}
                                                className="input text-sm w-full p-4 bg-zinc-800/50 border border-zinc-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                                                onChange={(e) => handleEventChange(index, 'name', e.target.value)}
                                                whileFocus={{ borderColor: "#a855f7" }}
                                            />
                                        </motion.fieldset>

                                        {/* Date */}
                                        <motion.fieldset 
                                            className="fieldset"
                                            whileFocus={{ scale: 1.02 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <legend className="fieldset-legend font-semibold mb-2 text-sm text-gray-300">Date</legend>
                                            <motion.input
                                                type="date"
                                                value={element.date.split('T')[0]}
                                                className="input text-sm w-full p-4 bg-zinc-800/50 border border-zinc-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-white"
                                                onChange={(e) => handleEventChange(index, 'date', e.target.value)}
                                                whileFocus={{ borderColor: "#a855f7" }}
                                            />
                                        </motion.fieldset>

                                        {/* Venue */}
                                        <motion.fieldset 
                                            className="fieldset"
                                            whileFocus={{ scale: 1.02 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <legend className="fieldset-legend font-semibold mb-2 text-sm text-gray-300">Venue</legend>
                                            <motion.input
                                                type="text"
                                                placeholder="Venue"
                                                value={element.venue}
                                                className="input text-sm w-full p-4 bg-zinc-800/50 border border-zinc-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                                                onChange={(e) => handleEventChange(index, 'venue', e.target.value)}
                                                whileFocus={{ borderColor: "#a855f7" }}
                                            />
                                        </motion.fieldset>

                                        {/* Time */}
                                        <motion.fieldset 
                                            className="fieldset"
                                            whileFocus={{ scale: 1.02 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <legend className="fieldset-legend font-semibold mb-2 text-sm text-gray-300">Time</legend>
                                            <motion.input
                                                type="time"
                                                placeholder="Time"
                                                value={element.time}
                                                className="input text-sm w-full p-4 bg-zinc-800/50 border border-zinc-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-white"
                                                onChange={(e) => handleEventChange(index, 'time', e.target.value)}
                                                whileFocus={{ borderColor: "#a855f7" }}
                                            />
                                        </motion.fieldset>
                                    </div>

                                    {/* Image Upload */}
                                    <motion.fieldset 
                                        className="fieldset my-6"
                                        whileHover={{ scale: 1.02 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <legend className="fieldset-legend font-semibold mb-2 text-sm text-gray-300">Event Logo</legend>
                                        <div className="flex items-center gap-4">
                                            <motion.label 
                                                htmlFor={`file-input-${index}`}
                                                className="relative cursor-pointer group"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                <motion.img
                                                    src={imagePreviews[index] || element.imgUrl || upload_area}
                                                    className="w-24 h-24 object-cover rounded-xl border-2 border-zinc-600 group-hover:border-primary transition-all duration-300"
                                                    alt="Upload"
                                                    layoutId={`image-${index}`}
                                                />
                                                {uploadingStates[index] && (
                                                    <motion.div 
                                                        className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                    >
                                                        <LoadingSpinner />
                                                    </motion.div>
                                                )}
                                                <motion.div 
                                                    className="absolute inset-0 bg-primary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                                                >
                                                    <i className="fa-solid fa-camera text-white text-xl"></i>
                                                </motion.div>
                                            </motion.label>
                                            <input
                                                type="file"
                                                hidden
                                                id={`file-input-${index}`}
                                                onChange={(e) => handleImageChange(e, index)}
                                            />
                                            <div className="text-xs text-gray-400">
                                                Click to upload image
                                            </div>
                                        </div>
                                    </motion.fieldset>

                                    {/* Description */}
                                    <motion.fieldset 
                                        className="fieldset my-6"
                                        whileFocus={{ scale: 1.02 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <legend className="fieldset-legend font-semibold mb-2 text-sm text-gray-300">Event Description</legend>
                                        <motion.textarea
                                            placeholder="Event Description"
                                            value={element.description}
                                            rows={4}
                                            className="input text-sm w-full p-4 bg-zinc-800/50 border border-zinc-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 resize-none"
                                            onChange={(e) => handleEventChange(index, 'description', e.target.value)}
                                            whileFocus={{ borderColor: "#a855f7" }}
                                        />
                                    </motion.fieldset>

                                    {/* Rules */}
                                    <motion.fieldset 
                                        className="fieldset my-6"
                                        layout
                                    >
                                        <legend className="fieldset-legend font-semibold mb-3 text-sm text-gray-300">Rules</legend>
                                        <AnimatePresence>
                                            {element.rules.map((rule, ruleIndex) => (
                                                <motion.div 
                                                    key={ruleIndex} 
                                                    className="flex gap-3 items-start mb-3"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                                                    layout
                                                >
                                                    <motion.textarea
                                                        onChange={(e) => {
                                                            const updated = { ...formData };
                                                            updated.events[index].rules[ruleIndex] = e.target.value;
                                                            setFormData(updated);
                                                        }}
                                                        rows={3}
                                                        placeholder={`Rule ${ruleIndex + 1}`}
                                                        value={rule}
                                                        className="flex-1 textarea text-sm p-3 bg-zinc-800/50 border border-zinc-600 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-white placeholder-gray-400 resize-none"
                                                        whileFocus={{ borderColor: "#a855f7", scale: 1.02 }}
                                                    />
                                                    {element.rules.length > 1 && (
                                                        <motion.button
                                                            type="button"
                                                            className="text-red-500 font-bold text-lg hover:text-red-300 w-10 h-10 rounded-xl hover:bg-red-500/20 flex items-center justify-center transition-all duration-300"
                                                            onClick={() => {
                                                                const updated = { ...formData };
                                                                updated.events[index].rules.splice(ruleIndex, 1);
                                                                setFormData(updated);
                                                            }}
                                                            whileHover={{ scale: 1.1, rotate: 90 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <i className="fa-solid fa-xmark"></i>
                                                        </motion.button>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        <motion.button
                                            type="button"
                                            className="text-sm mt-2 px-4 py-2 border border-primary text-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-300 flex items-center gap-2"
                                            onClick={() => {
                                                const updated = { ...formData };
                                                updated.events[index].rules.push('');
                                                setFormData(updated);
                                            }}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <i className="fa-solid fa-plus"></i>
                                            Add Rule
                                        </motion.button>
                                    </motion.fieldset>
                                </motion.div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <motion.div 
                        className='flex justify-center mb-8'
                        variants={itemVariants}
                    >
                        <motion.button
                            className="text-lg flex items-center justify-center w-14 h-14 font-bold border-primary border text-primary rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-lg"
                            onClick={addNewEvent}
                            whileHover={{ 
                                scale: 1.1, 
                                boxShadow: "0 10px 30px rgba(168, 85, 247, 0.3)" 
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <i className="fa-solid fa-plus"></i>
                        </motion.button>
                    </motion.div>

                    <motion.div 
                        className='flex justify-center gap-6'
                        variants={itemVariants}
                    >
                        <motion.button
                            className="px-8 py-3 font-semibold border-primary border text-primary rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-lg min-w-32 flex items-center justify-center gap-2"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            whileHover={{ 
                                scale: 1.05,
                                boxShadow: "0 10px 30px rgba(168, 85, 247, 0.3)"
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isSubmitting ? (
                                <>
                                    <LoadingSpinner />
                                    Updating...
                                </>
                            ) : (
                                'Update'
                            )}
                        </motion.button>

                        <motion.button
                            className="px-8 py-3 font-semibold border-red-500 border text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all duration-300 shadow-lg min-w-32"
                            onClick={() => {
                                fetchEventDetails();
                                toast.error('No changes were applied', {
                                    position: 'top-right',
                                    style: {
                                        backgroundColor: "#18181b",
                                        color: "#ffffff",
                                    },
                                });
                            }}
                            whileHover={{ 
                                scale: 1.05,
                                boxShadow: "0 10px 30px rgba(239, 68, 68, 0.3)"
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Cancel
                        </motion.button>
                    </motion.div>
                </motion.div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default EventDetails;