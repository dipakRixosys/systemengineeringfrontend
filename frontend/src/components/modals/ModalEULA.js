function ModalEULA() {
  return(
    <div className="modal fade" id="ModalEULA" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-primary">
              Read <b>Terms of Condition &amp; EULA</b>
            </h4>
            <button type="button" className="close" data-dismiss="modal">
              <span>&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <h3>ToC</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce varius cursus porttitor. Donec vel turpis ante. Praesent semper consectetur tristique. Curabitur imperdiet justo et nibh posuere sagittis. Nulla nec purus eu diam imperdiet hendrerit. Morbi ac nisl diam. Sed tellus libero, faucibus non sagittis rhoncus, tempus sit amet nibh. Etiam malesuada, neque vitae commodo faucibus, tortor nibh facilisis sem, sed efficitur ligula metus non velit. Cras eu mi consequat, blandit augue in, dignissim justo.</p>
            <hr />
            
            <h3>EULA</h3>
            <p>Donec elementum rutrum ante, at ullamcorper lorem molestie a. Suspendisse commodo nunc mauris, ut aliquam arcu dictum vel. Fusce maximus lorem eget ornare interdum. Nunc vel tincidunt libero. Nunc faucibus ornare nulla, eu dictum risus mollis vel. Nam commodo iaculis aliquam. Nunc non sodales nulla, eu lobortis arcu. Fusce eros augue, finibus at malesuada ut, blandit a metus. Nam imperdiet, turpis sed maximus viverra, justo lorem porta magna, sit amet volutpat leo est eget arcu. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla accumsan eget lacus id tempor.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalEULA;