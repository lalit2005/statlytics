import { Link } from "@remix-run/react";
import {
  RiDashboardFill,
  RiDashboardLine,
  RiLogoutCircleLine,
  RiTeamLine,
} from "@remixicon/react";

type SidebarProps = {
  children: React.ReactNode;
};

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-12 w-screen">
      <div className="col-span-2 px-5 py-10 border-r border-zinc-800 fixed max-w-60 w-full">
        <p className="text-2xl font-medium text-zinc-200">Statlytics</p>
        <ul className="mt-14 space-y-3">
          <li>
            <Link
              to="/dashboard"
              className="text-zinc-200 hover:text-zinc-400 transition-colors duration-200"
            >
              <RiDashboardLine className="inline-block mr-2" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/teams"
              className="text-zinc-200 hover:text-zinc-400 transition-colors duration-200"
            >
              <RiTeamLine className="inline-block mr-2" />
              Team
            </Link>
          </li>
          <li>
            <Link
              to="/logout"
              className="text-zinc-200 hover:text-zinc-400 transition-colors duration-200"
            >
              <RiLogoutCircleLine className="inline-block mr-2" />
              Logout
            </Link>
          </li>
        </ul>
      </div>
      <div className="col-span-10 ml-60 w-full">{children}</div>
    </div>
  );
};

export default Sidebar;
