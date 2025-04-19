// @ts-nocheck
import { Link, useParams } from "@remix-run/react";
import { AreaChart } from "~/components/AreaChart";
import { BarList } from "~/components/BarList";
import ProtectedRoute from "~/components/ProtectedRoute";
import fetcher from "~/lib/fetcher";
import useSwr from "swr";
import { RiAlignLeft, RiArrowLeftWideFill } from "@remixicon/react";

const SitePage = () => {
  const { siteId } = useParams();

  const { data, error } = useSwr(
    `/analytics-data?website_id=${siteId}`,
    fetcher
  );

  const isLoading = !data && !error;
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl font-medium animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl font-medium">
          Waiting for people to visit the site!
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-2xl font-medium">Error: {error.message}</p>
      </div>
    );
  }

  // Aggregate pageviews by date for the chart
  const chartDataObj = data.pageviews.reduce((acc, pv) => {
    const date = new Date(pv.timestamp).toISOString().slice(0, 10); // YYYY-MM-DD format
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(chartDataObj)
    .map(([date, count]) => ({ date, pageviews: count }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Aggregate page visits by path
  const pageVisitObj = data.pageviews.reduce((acc, pv) => {
    acc[pv.path] = (acc[pv.path] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const pageVisits = Object.entries(pageVisitObj).map(([name, value]) => ({
    name,
    value,
  }));

  // Aggregate browser usage from visitors
  const browserObj = data.visitors.reduce((acc, visitor) => {
    acc[visitor.browser] = (acc[visitor.browser] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const browserUsage = Object.entries(browserObj).map(([name, value]) => ({
    name,
    value,
  }));

  const operatingSystemObj = data.visitors.reduce((acc, visitor) => {
    acc[visitor.operating_system] = (acc[visitor.operating_system] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const operatingSystemUsage = Object.entries(operatingSystemObj).map(
    ([name, value]) => ({
      name,
      value,
    })
  );
  const deviceObj = data.visitors.reduce((acc, visitor) => {
    acc[visitor.device] = (acc[visitor.device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const deviceUsage = Object.entries(deviceObj).map(([name, value]) => ({
    name,
    value,
  }));
  const locationObj = data.visitors.reduce((acc, visitor) => {
    acc[visitor.location] = (acc[visitor.location] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const locationUsage = Object.entries(locationObj).map(([name, value]) => ({
    name,
    value,
  }));
  const referrerObj = data.pageviews.reduce((acc, pv) => {
    let domain = "unknown";
    if (pv.referrer) {
      try {
        domain = new URL(pv.referrer).hostname.replace(/^www\./, "");
      } catch (err) {
        domain = "unknown";
      }
    }
    acc[domain] = (acc[domain] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const referrerUsage = Object.entries(referrerObj).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto w-full">
        <div className="mt-20">
          <div className="text-sm text-zinc-600 hover:text-zinc-400 mb-5">
            <Link to={"/dashboard"} className="block -ml-2">
              <RiArrowLeftWideFill className="scale-75 inline-block -mt-0.5 mr-0.5" />
              Go back
            </Link>
          </div>
          <h1 className="text-lg text-zinc-500">
            {data && data?.website[0]?.url}
          </h1>
          <p className="text-xl font-medium">
            {data && data?.website[0]?.name}
          </p>
        </div>
        <section className="mt-16">
          {/* <pre>
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
         */}
        </section>
        <section className="mt-16">
          <h3 className="mb-5">Page Views</h3>
          <AreaChart
            className="h-52"
            data={chartData}
            index="date"
            categories={["pageviews"]}
            showLegend={false}
          />
        </section>
        <div className="grid grid-cols-2 gap-10 mt-16">
          <section>
            <h3 className="mb-5">Page Visits</h3>
            <BarList data={pageVisits} />
          </section>
          <section>
            <h3 className="mb-5">Browser Usage</h3>
            <BarList data={browserUsage} />
          </section>
          <section>
            <h3 className="mb-5">Operating System Usage</h3>
            <BarList data={operatingSystemUsage} />
          </section>
          <section>
            <h3 className="mb-5">Device Usage</h3>
            <BarList data={deviceUsage} />
          </section>
          <section>
            <h3 className="mb-5">Location Usage</h3>
            <BarList data={locationUsage} />
          </section>
          <section>
            <h3 className="mb-5">Referrer Usage</h3>
            <BarList data={referrerUsage} />
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default SitePage;
