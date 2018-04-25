import { invoke } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import {
  Container,
  Dimmer,
  Header,
  Loader,
  Message,
  Segment,
  Step,
} from 'semantic-ui-react';
import { ConfigurationForm, CredentialsForm, Report } from '../components';
import {
  activeStepSelector,
  configurationSelector,
  credentialsSelector,
  loadingSelector,
  refreshReport,
  reportSelector,
  saveConfiguration,
  saveCredentials,
  setActiveStep,
  stepsConfigSelector,
  errorSelector,
} from '../redux';

const steps = [
  { description: 'Authorize Kubera', title: 'Credentials' },
  { description: 'Pick your repo & project', title: 'Configuration' },
  { description: 'Analyze your data', title: 'Report' },
];

class Kubera extends React.Component {
  handleStepChange = number => {
    this.props.onStepChange(number);
  };

  render() {
    const {
      activeStep,
      configuration,
      credentials,
      error,
      loading,
      onRefreshReport,
      onSaveConfiguration,
      onSaveCredentials,
      report,
      stepsConfig,
    } = this.props;
    const containerStyles = { padding: '2em 0' };
    const stepContentRenderers = [
      () => <CredentialsForm {...credentials} onSave={onSaveCredentials} />,
      () => (
        <ConfigurationForm {...configuration} onSave={onSaveConfiguration} />
      ),
      () => <Report {...report} onRefresh={onRefreshReport} />,
    ];

    return (
      <Container style={containerStyles} text>
        <Dimmer active={loading} inverted>
          <Loader indeterminate />
        </Dimmer>
        <Header size="huge">Kubera</Header>
        {error && (
          <Message negative>
            <Message.Header>Error</Message.Header>
            <p>{error}</p>
          </Message>
        )}
        <div>
          <Step.Group attached="top" ordered>
            {steps.map((step, i) => (
              <Step
                {...stepsConfig[i]}
                key={step.title}
                onClick={() => this.handleStepChange(i)}
              >
                <Step.Content>
                  <Step.Title>{step.title}</Step.Title>
                  <Step.Description>{step.description}</Step.Description>
                </Step.Content>
              </Step>
            ))}
          </Step.Group>
          <Segment attached clearing>
            {invoke(stepContentRenderers, activeStep)}
          </Segment>
        </div>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    activeStep: activeStepSelector(state),
    configuration: configurationSelector(state),
    credentials: credentialsSelector(state),
    error: errorSelector(state),
    loading: loadingSelector(state),
    report: reportSelector(state),
    stepsConfig: stepsConfigSelector(state),
  };
}

const mapDispatchToProps = {
  onRefreshReport: refreshReport,
  onStepChange: setActiveStep,
  onSaveConfiguration: saveConfiguration,
  onSaveCredentials: saveCredentials,
};

export default connect(mapStateToProps, mapDispatchToProps)(Kubera);
