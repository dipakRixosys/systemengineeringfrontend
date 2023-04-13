//
function DatatableNoRows(props) {
  return(
    <div className="DatatableNoRows m-4">
      <div className="w-100">
        { props['text'] ?? "No rows found." }
      </div>
    </div>
  )
}

export default DatatableNoRows;