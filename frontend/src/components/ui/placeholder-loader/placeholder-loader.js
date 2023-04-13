import './placeholder-loader.css';

function PlaceholderLoader() {
  return(
    <div className="PlaceholderLoader">
      <div className="ph-item">
        <div className="ph-col-12">
          <div className="ph-row">
            <div className="ph-col-12 big"></div>
            <div className="ph-col-4"></div>
            <div className="ph-col-8 empty"></div>
            <div className="ph-col-6"></div>
            <div className="ph-col-6 empty"></div>
            <div className="ph-col-12"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaceholderLoader;