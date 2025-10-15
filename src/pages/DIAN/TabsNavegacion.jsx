export default function TabsNavegacion({ tabs, tabActiva, setTabActiva }) {
    return (
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  tabActiva === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icono}</span>
                {tab.nombre}
              </button>
            ))}
          </nav>
        </div>
      </div>
    );
  }