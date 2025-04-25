declare module 'lucide-react' {
  import { ComponentType } from 'react';
  
  interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
  }
  
  type Icon = ComponentType<IconProps>;
  
  export const ArrowRight: Icon;
  export const Building2: Icon;
  export const Calendar: Icon;
  export const Clock: Icon;
  export const DollarSign: Icon;
  export const Check: Icon;
  export const Zap: Icon;
  export const Send: Icon;
  export const AlertCircle: Icon;
  export const Bot: Icon;
  export const Globe: Icon;
  export const Target: Icon;
  export const Lock: Icon;
  export const BarChart3: Icon;
  export const X: Icon;
  // Add other icons as needed
} 