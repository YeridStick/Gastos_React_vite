import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export default function DashboardLink({ activeTab, onNavigate }) {
  return (
    <div>
      <div className="space-y-1">
        <Link
          to="/dashboard"
          onClick={() => onNavigate("/dashboard")}
          className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
            activeTab === "dashboard"
              ? "bg-blue-50 text-blue-700"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }`}
        >
          <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Dashboard
        </Link>
      </div>
    </div>
  );
}

DashboardLink.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
};
