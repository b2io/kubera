import React from 'react';
import { connect } from 'react-redux';
import {
  Container,
  Dimmer,
  Header,
  Loader,
  Segment,
  Step,
} from 'semantic-ui-react';
import { ConfigurationForm, CredentialsForm, Report } from '../components';
import {
  activeStepSelector,
  configurationSelector,
  credentialsSelector,
  loadingSelector,
  reportSelector,
  saveConfiguration,
  saveCredentials,
  setActiveStep,
  stepsConfigSelector,
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
      loading,
      onSaveConfiguration,
      onSaveCredentials,
      report,
      stepsConfig,
    } = this.props;
    const containerStyles = { padding: '2em 0' };

    // TODO: Show the appropriate content for each step.
    const content = [
      () => <CredentialsForm {...credentials} onSave={onSaveCredentials} />,
      () => (
        <ConfigurationForm {...configuration} onSave={onSaveConfiguration} />
      ),
      () => <Report {...report} />,
    ];

    return (
      <Container style={containerStyles} text>
        <Header size="huge">Kubera</Header>
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
          <Segment attached>
            <Dimmer active={loading} inverted>
              <Loader indeterminate />
            </Dimmer>
            {content[activeStep]()}
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
    loading: loadingSelector(state),
    report: reportSelector(state),
    stepsConfig: stepsConfigSelector(state),
  };
}

const mapDispatchToProps = {
  onStepChange: setActiveStep,
  onSaveConfiguration: saveConfiguration,
  onSaveCredentials: saveCredentials,
};

export default connect(mapStateToProps, mapDispatchToProps)(Kubera);
