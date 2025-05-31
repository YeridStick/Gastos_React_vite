import PropTypes from "prop-types";
import NavigationItem from "./NavigationItem";

export default function NavigationSection({ title, items, activeTab, onNavigate }) {
  return (
    <div>
      <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        {title}
      </h3>
      <div className="mt-2 space-y-1">
        {items.map((item) => (
          <NavigationItem
            key={item.path}
            path={item.path}
            label={item.label}
            icon={item.icon}
            activeTab={activeTab}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}

NavigationSection.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
    })
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  onNavigate: PropTypes.func.isRequired,
};