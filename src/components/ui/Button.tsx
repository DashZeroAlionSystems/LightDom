type Variant = 'default' | 'outline' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size } > = ({
  children,
  className = '',
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const variantClass = {
    default: 'bg-blue-600 hover:bg-blue-700 text-white',
    outline: 'border border-gray-300 hover:bg-gray-50',
    destructive: 'bg-red-600 hover:bg-red-700 text-white'
  }[variant];

  const sizeClass = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2',
    lg: 'px-4 py-3 text-lg'
  }[size];

  return (
    <button className={`rounded ${variantClass} ${sizeClass} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;