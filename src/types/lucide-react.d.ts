declare module 'lucide-react' {
  import { ComponentType } from 'react';
  
  interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
  }
  
  type Icon = ComponentType<IconProps>;
  export type LucideIcon = Icon;
  
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
  export const Users: Icon;
  export const Search: Icon;
  export const Package: Icon;
  export const Sparkles: Icon;
  export const ShoppingCart: Icon;
  export const HelpCircle: Icon;
  export const Bolt: Icon;
  export const LineChart: Icon;
  export const DynamicIcon: Icon;
  export const CheckCircle: Icon;
  export const MessageSquare: Icon;
  export const Mail: Icon;
  export const FileText: Icon;
  export const Code: Icon;
  export const CreditCard: Icon;
  export const LayoutDashboard: Icon;
  export const FileCog: Icon;
  export const ChevronLeftIcon: Icon;
  export const ChevronRightIcon: Icon;
  // Add other icons as needed
} 