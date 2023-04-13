// React
import React from 'react';
// React Router
import { withRouter } from 'react-router-dom';
// Analysis Page 
import StatisticalAnalysis from 'screens/Dashboard/Analysis/Statistical-Analysis';

// Statistical Analysis
class ProgramAnalysis extends React.Component {
  //
  async componentDidMount() {
    //
  }
  //
  render() {
    return (
      <div>
        <StatisticalAnalysis programUuid={this.props['match']['params']} />
      </div>
    );
  }
}

// Statistical Analysis
export default withRouter(ProgramAnalysis);