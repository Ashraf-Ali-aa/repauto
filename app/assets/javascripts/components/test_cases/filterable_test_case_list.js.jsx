var FilterableTestCaseList = React.createClass({
  propTypes: {
    url: React.PropTypes.string,
    onItemSelected: React.PropTypes.func
  },
  getInitialState: function() {
    return {
      testCases: [],
      view: 'feature',
      filterText: ''
    };
  },
  loadContent: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({testCases: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },

  componentDidMount: function() {
    this.loadContent();
  },

  handleUserInput: function(filterText) {
    this.setState({
      filterText: filterText
    });
  },

  handleViewChange: function(view) {
    this.setState({view: view});
  },

  filter: function(testCases) {
    if (this.state.filterText === '') {
      return testCases;
    } else {
      var options = {
        keys: ['name']
      }
      var f = new Fuse(testCases, options);
      return f.search(this.state.filterText);
    }
  },

  group: function(testCases) {
    return groupBy(testCases, function(item) {
      switch (this.state.view) {
        case 'feature':
          return item.test_suite.name;
          break;
        case 'error':
          return item.failure ? item.failure.message : null;
          break;
        default:
          return item.test_suite.name;
          break;
      }
    });
  },

  onItemSelected: function(selected) {
    this.props.onItemSelected(selected);
  },

  render: function() {
    var filtered = this.filter(this.state.testCases);
    var view = this.state.view;
    var grouped = groupBy(filtered, function(item) {
      switch (view) {
        case 'feature':
          return item.test_suite.name;
          break;
        case 'error':
          return item.failure ? item.failure.message : null;
          break;
        default:
          return item.test_suite.name;
          break;
      }
    });
    var groups = Object.keys(grouped);
    var groupedTestCases = groups.map(function (g){
      return (
        <TestCaseGroup
          key={_.uniqueId('tcg-')}
          onItemSelected={this.onItemSelected}
          name={g}
          testCases={grouped[g]} />
      );
    }, this);
    var radios = ['feature', 'error'].map(function(o) {
      return {label: o, value: o, checked: (o == this.state.view)};
    }, this);
    return (
      <div className="test-case-list">
        <div className="row">
          <SearchBar onUserInput={this.handleUserInput}/>
          <RadioSet group="view" onChange={this.handleViewChange} radios={radios} />
        </div>
        <div className="row">
          {groupedTestCases}
        </div>
      </div>
    );
  }
});
