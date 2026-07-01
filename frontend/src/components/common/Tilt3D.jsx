import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

// Wraps any card-like content with a subtle, mouse-reactive 3D tilt.
// Usage: <Tilt3D><div className="...">content</div></Tilt3D>
const Tilt3D = ({ children, className = '', intensity = 10, scale = 1.02, ...rest }) => {
  const ref = useRef(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const springConfig = { stiffness: 200, damping: 20 };
  const rotateX = useSpring(useTransform(y, [0, 1], [intensity, -intensity]), springConfig);
  const rotateY = useSpring(useTransform(x, [0, 1], [-intensity, intensity]), springConfig);

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      whileHover={{ scale }}
      transition={{ scale: { duration: 0.2 } }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default Tilt3D;
