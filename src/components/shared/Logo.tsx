interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  withBackground?: boolean;
}

export const Logo = ({ 
  className = '', 
  width = 120, 
  height = 30,
  withBackground = false
}: LogoProps) => {
  return (
    <div className={`logo-container ${className}`} style={{ width, height }}>
      <div 
        className={`w-full h-full flex items-center justify-center rounded ${
          withBackground ? 'bg-card' : ''
        }`}
      >
        <img
          src="/icons/logo_plannersystem.png"
          alt="PlannerSystem"
          className="w-full h-full object-contain p-1"
        />
      </div>
    </div>
  );
};

export default Logo;