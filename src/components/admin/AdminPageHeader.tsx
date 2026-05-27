

export const AdminPageHeader = ({ title, description, icon: Icon, action }: any) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
    <div>
      <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-2">
        {Icon && <Icon className="text-brand-orange" />}
        {title}
      </h1>
      {description && <p className="text-sm text-white/50">{description}</p>}
    </div>
    {action && (
      <button 
        onClick={action.onClick}
        className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-neonOrange text-sm font-bold text-white transition-all duration-300"
      >
        {action.icon && <action.icon size={16} />}
        {action.label}
      </button>
    )}
  </div>
);
