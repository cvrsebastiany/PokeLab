import './TestTable.css'

function TestTable({ title, data }) {
  return (
    <div className="test-section">
      <h3>{title}</h3>
      <table className="test-table">
        <thead>
          <tr>
            <th>Test</th>
            <th>Result</th>
            <th>Normal Range</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((test, index) => (
            <tr key={index}>
              <td>{test.test}</td>
              <td className="result-value">{test.result}</td>
              <td>{test.normalRange}</td>
              <td>
                <span className={`status-badge ${test.status.toLowerCase()}`}>
                  {test.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TestTable
