import { Input } from "~/components/Input";
import ProtectedRoute from "~/components/ProtectedRoute";
import useSwr from "swr";
import fetcher from "~/lib/fetcher";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRoot,
  TableRow,
} from "~/components/Table";
import { useState } from "react";
import { format } from "date-fns";
import { Link, useNavigate } from "@remix-run/react";
import { Button } from "~/components/Button";

const DashboardPage = () => {
  const { data, error } = useSwr("/sites", fetcher);
  console.log(data);
  const isLoading = !data && !error;
  const [query, setQuery] = useState<string>("");
  const navigate = useNavigate();
  return (
    <ProtectedRoute>
      <div className="max-w-[90%] mx-auto w-full px-4 py-10">
        <p className="text-2xl font-medium">Dashboard</p>
        <div className="mt-10 grid grid-cols-7 grid-flow-row gap-4">
          <div className="col-span-5">
            <Input
              placeholder="Search..."
              onChange={(e) => {
                setQuery(e.target.value);
              }}
            />
          </div>
          <Link to={"/new"} className="col-span-1">
            <Button variant="light" className="col-span-1 w-full">
              <span className="ml-2">New site</span>
            </Button>
          </Link>
          <Link to={"/teams"} className="col-span-1">
            <Button variant="light" className="w-full">
              <span className="ml-2">Manage Team</span>
            </Button>
          </Link>
        </div>
        <div>
          {/* <pre>{data && JSON.stringify(data, null, 2)}</pre> */}
          <div className="mt-5">
            <TableRoot>
              <Table>
                <TableHead>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>URL</TableHeaderCell>
                  <TableHeaderCell>Created At</TableHeaderCell>
                  <TableHeaderCell>Last Updated At</TableHeaderCell>
                </TableHead>
                <TableBody>
                  {data &&
                    data.map((site: typeof exampleData) =>
                      site.name.toLowerCase().includes(query.toLowerCase()) ||
                      site.url.toLowerCase().includes(query.toLowerCase()) ? (
                        // <Link to={`/site/${site.website_id}`}
                        //   key={site.website_id}
                        //   className="block w-full"
                        // >
                        <TableRow
                          className="cursor-pointer hover:bg-zinc-900"
                          key={site.website_id}
                          onClick={() => {
                            navigate(`/site/${site.website_id}`);
                          }}
                        >
                          <TableCell>{site.name}</TableCell>
                          <TableCell>{site.url}</TableCell>
                          <TableCell>
                            {format(new Date(site.created_at), "yyyy-MM-dd")}
                          </TableCell>
                          <TableCell>
                            {format(new Date(site.updated_at), "yyyy-MM-dd")}
                          </TableCell>
                        </TableRow>
                      ) : // </Link>
                      null
                    )}
                </TableBody>
              </Table>
            </TableRoot>
            {isLoading && (
              <div className="text-center mt-10 animate-pulse">Loading...</div>
            )}
            {!isLoading && data && data.length == 0 && (
              <div className="text-center mt-10">No sites added yet!</div>
            )}
            {error && <div>Error loading data</div>}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};
export default DashboardPage;

const exampleData = {
  website_id: "2982cd7e-786b-42f7-a019-071366ec9ba4",
  user_id: "9aee04f1-515c-4144-b702-d41fdeef5282",
  url: "lalit.sh",
  tracking_id: "xwM-Yv",
  created_at: "2025-03-15T01:14:08.228Z",
  updated_at: "2025-03-15T01:14:08.228Z",
  name: "Personal site",
};
