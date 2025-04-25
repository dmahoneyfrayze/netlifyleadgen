import {
  Zap,
  Bot,
  Users,
  BarChart3,
  Globe,
  Search,
  Code,
  CreditCard,
  LineChart,
  Building2,
  DollarSign,
  type LucideIcon
} from "lucide-react";

export function getCategoryIcon(category: string): LucideIcon {
  switch (category) {
    case "ai":
      return Bot;
    case "automation":
      return Zap;
    case "crm":
      return Users;
    case "analytics":
      return BarChart3;
    case "web":
      return Globe;
    case "seo":
      return Search;
    case "integration":
      return Code;
    case "billing":
      return CreditCard;
    case "reporting":
      return LineChart;
    case "realestate":
      return Building2;
    case "pricing":
      return DollarSign;
    default:
      return Zap;
  }
}