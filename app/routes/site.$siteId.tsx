import { AreaChart } from "~/components/AreaChart";
import { BarList } from "~/components/BarList";
import ProtectedRoute from "~/components/ProtectedRoute";

const SitePage = () => {
  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto w-full">
        <div className="mt-20 space-y-16">
          <h1 className="text-xl font-medium">Product Documentation</h1>
        </div>
        <section className="mt-16"></section>
        <section>
          <h3 className="mb-5">Page views</h3>
          <AreaChart
            className="h-52"
            data={chartdata}
            index="date"
            categories={["Views"]}
            showLegend={false}
          />
        </section>
        <div className="grid grid-cols-2 gap-10 mt-16">
          <section>
            <h3 className="mb-5">Page visits</h3>
            <BarList data={data} />
          </section>
          <section>
            <h3 className="mb-5">Browser usage</h3>
            <BarList data={data} />
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SitePage;

const data = [
  { name: "/home", value: 843 },
  { name: "/imprint", value: 46 },
  { name: "/cancellation", value: 3 },
  { name: "/blocks", value: 108 },
  { name: "/documentation", value: 384 },
];

const chartdata = [
  {
    date: "Jan 23",
    Views: 2890,
    Inverters: 2338,
  },
  {
    date: "Feb 23",
    Views: 2756,
    Inverters: 2103,
  },
  {
    date: "Mar 23",
    Views: 3322,
    Inverters: 2194,
  },
  {
    date: "Apr 23",
    Views: 3470,
    Inverters: 2108,
  },
  {
    date: "May 23",
    Views: 3475,
    Inverters: 1812,
  },
  {
    date: "Jun 23",
    Views: 3129,
    Inverters: 1726,
  },
  {
    date: "Jul 23",
    Views: 3490,
    Inverters: 1982,
  },
  {
    date: "Aug 23",
    Views: 2903,
    Inverters: 2012,
  },
  {
    date: "Sep 23",
    Views: 2643,
    Inverters: 2342,
  },
  {
    date: "Oct 23",
    Views: 2837,
    Inverters: 2473,
  },
  {
    date: "Nov 23",
    Views: 2954,
    Inverters: 3848,
  },
  {
    date: "Dec 23",
    Views: 3239,
    Inverters: 3736,
  },
];
