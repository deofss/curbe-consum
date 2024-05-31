import { useState, useEffect, startTransition } from "react";
import {
  AreaChart,
  LineChart,
  Line,
  BarChart,
  Bar,
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
  const [data, setData] = useState<any>();

  useEffect(() => {
    let subscribed = true;

    let interval: any;
    if (subscribed) {
      interval = setTimeout(() => {
        setIsMounted(true);
      }, 1500);
      startNonBlockingTransition();
    }

    return () => {
      subscribed = false;
      clearInterval(interval);
    };
  }, []);

  function startNonBlockingTransition() {
    startTransition(() => {
      setData(chartData);
    });
  }

  if (!data) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoaderCircle className="animate-spin" size={16} />
      </div>
    );
  }

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
        data={data}
        margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <YAxis
          axisLine={false}
          type="number"
          domain={["dataMin", "dataMax+10"]}
          width={30}
        />
        <Area
          type="monotone"
          isAnimationActive={false}
          dataKey="value"
          stroke="#64748b"
          fill="#cbd5e1"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default Chart;
