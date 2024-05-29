import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  YAxis,
  XAxis,
  ResponsiveContainer,
} from "recharts";

import { LoaderCircle } from "lucide-react";

const Chart = ({ chartData }: { chartData: { value: number }[] }) => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoaderCircle className="animate-spin" size={16} />
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={50}>
      <AreaChart
        height={50}
        data={chartData}
        margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <YAxis
          axisLine={false}
          type="number"
          domain={["dataMin", "dataMax+10"]}
        />
        <XAxis dataKey="date" hide />
        <Area
          type="monotone"
          isAnimationActive={false}
          dataKey="value"
          stroke="#8884d8"
          fill="#8884d8"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default Chart;
