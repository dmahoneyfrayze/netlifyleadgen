import * as React from 'react';
import { ResponsiveContainer, Tooltip, TooltipProps } from "recharts";
import { Card } from "@/components/ui/card";
import {
  NameType,
  ValueType,
} from 'recharts/types/component/DefaultTooltipContent';

interface ChartConfig {
  theme: 'light' | 'dark';
  grid?: boolean;
}

interface ChartProps {
  config: ChartConfig;
  children: React.ComponentProps<typeof ResponsiveContainer>['children'];
}

const ChartContext = React.createContext<{
  chartId: string;
  config: ChartConfig;
}>({
  chartId: '',
  config: { theme: 'light' },
});

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  ({ config, children, ...props }, ref) => {
    const chartId = React.useId();

    return (
      <ChartContext.Provider value={{ chartId, config }}>
        <div ref={ref} {...props}>
          <ChartStyle id={chartId} config={config} />
          <ResponsiveContainer>
            {children}
          </ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    );
  }
);
Chart.displayName = 'Chart';

const ChartTooltip = Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  TooltipProps<ValueType, NameType> &
    React.ComponentProps<'div'> & {
      hideLabel?: boolean;
    }
>((props, ref) => {
  const { active, payload, label, hideLabel, ...rest } = props;

  if (!active || !payload) {
    return null;
  }

  return (
    <Card ref={ref} {...rest}>
      <div className="grid gap-2">
        {!hideLabel && (
          <div className="text-xs text-muted-foreground">{label}</div>
        )}
        <div className="flex gap-4">
          {payload.map((item: any) => (
            <div key={item.name}>
              <div className="flex items-center gap-1">
                <div
                  className="rounded-full px-1"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
                <span className="text-sm font-medium">
                  {item.value}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {item.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
});
ChartTooltipContent.displayName = 'ChartTooltipContent';

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          #${id} {
            --chart-text: ${
              config.theme === 'dark' ? 'hsl(0 0% 100%)' : 'hsl(0 0% 0%)'
            };
            --chart-grid: ${
              config.theme === 'dark'
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.1)'
            };
          }

          #${id} .recharts-cartesian-grid line {
            stroke: var(--chart-grid);
          }

          #${id} .recharts-text {
            fill: var(--chart-text);
          }
        `,
      }}
    />
  );
};

export { Chart, ChartTooltip, ChartTooltipContent };
