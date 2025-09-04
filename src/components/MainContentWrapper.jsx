/**
 * MainContentWrapper - A reusable layout component for consistent padding and spacing
 * across main content pages.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to wrap
 * @param {boolean} [props.useMaxWidth=true] - Whether to apply max-width container
 * @param {string} [props.maxWidth="max-w-4xl"] - The max-width class to apply
 * @param {string} [props.className=""] - Additional CSS classes
 */
function MainContentWrapper({ 
  children, 
  useMaxWidth = true, 
  maxWidth = "max-w-4xl", 
  className = "" 
}) {
  return (
    <div className={`p-4 md:p-6 ${className}`}>
      {useMaxWidth ? (
        <div className={`${maxWidth} mx-auto`}>
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export default MainContentWrapper;