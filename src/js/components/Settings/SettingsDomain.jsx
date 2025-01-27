import React, { Component } from 'react';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import InputBase from '@material-ui/core/InputBase';
import styled from 'styled-components';
import PremiumableButton from '../Widgets/PremiumableButton';
import AppActions from '../../actions/AppActions';
import FacebookStore from '../../stores/FacebookStore';
import LoadingWheel from '../LoadingWheel';
import OrganizationActions from '../../actions/OrganizationActions';
import OrganizationStore from '../../stores/OrganizationStore';
import { renderLog } from '../../utils/logging';
import SettingsAccount from './SettingsAccount';
import VoterStore from '../../stores/VoterStore';
import SettingsAccountLevelChip from './SettingsAccountLevelChip';

class SettingsDomain extends Component {
  static propTypes = {
    classes: PropTypes.object,
  };

  constructor (props) {
    super(props);
    this.state = {
      organization: {},
      organizationWeVoteId: '',
      organizationChosenDomainName: '',
      organizationChosenDomainNameSavedValue: '',
      organizationChosenDomainNameChangedLocally: false,
      organizationChosenSubDomain: '',
      organizationChosenSubDomainSavedValue: '',
      organizationChosenSubDomainChangedLocally: false,
      voter: {},
      voterIsSignedIn: false,
      radioGroupValue: 'subDomainRadioButtonSelected',
      voterIsPremium: false, /* This is hard-coded for testing purposes, this will be later set based on API calls that aren't set up */
    };
  }

  componentDidMount () {
    // console.log('SettingsDomain componentDidMount');
    this.onOrganizationStoreChange();
    this.onVoterStoreChange();
    this.organizationStoreListener = FacebookStore.addListener(this.onOrganizationStoreChange.bind(this));
    this.voterStoreListener = VoterStore.addListener(this.onVoterStoreChange.bind(this));
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.state.organizationWeVoteId !== nextState.organizationWeVoteId) {
      // console.log('this.state.organizationWeVoteId', this.state.organizationWeVoteId, ', nextState.organizationWeVoteId', nextState.organizationWeVoteId);
      return true;
    }
    if (this.state.voterIsSignedIn !== nextState.voterIsSignedIn) {
      // console.log('this.state.voterIsSignedIn', this.state.voterIsSignedIn, ', nextState.voterIsSignedIn', nextState.voterIsSignedIn);
      return true;
    }
    if (this.state.organizationChosenDomainName !== nextState.organizationChosenDomainName) {
      // console.log('this.state.organizationChosenDomainName', this.state.organizationChosenDomainName, ', nextState.organizationChosenDomainName', nextState.organizationChosenDomainName);
      return true;
    }
    if (this.state.organizationChosenDomainNameChangedLocally !== nextState.organizationChosenDomainNameChangedLocally) {
      // console.log('this.state.organizationChosenDomainNameChangedLocally', this.state.organizationChosenDomainNameChangedLocally, ', nextState.organizationChosenDomainNameChangedLocally', nextState.organizationChosenDomainNameChangedLocally);
      return true;
    }
    if (this.state.organizationChosenDomainNameSavedValue !== nextState.organizationChosenDomainNameSavedValue) {
      // console.log('this.state.organizationChosenDomainNameSavedValue', this.state.organizationChosenDomainNameSavedValue, ', nextState.organizationChosenDomainNameSavedValue', nextState.organizationChosenDomainNameSavedValue);
      return true;
    }
    if (this.state.organizationChosenSubDomain !== nextState.organizationChosenSubDomain) {
      // console.log('this.state.organizationChosenSubDomain', this.state.organizationChosenSubDomain, ', nextState.organizationChosenSubDomain', nextState.organizationChosenSubDomain);
      return true;
    }
    if (this.state.organizationChosenSubDomainChangedLocally !== nextState.organizationChosenSubDomainChangedLocally) {
      // console.log('this.state.organizationChosenSubDomainChangedLocally', this.state.organizationChosenSubDomainChangedLocally, ', nextState.organizationChosenSubDomainChangedLocally', nextState.organizationChosenSubDomainChangedLocally);
      return true;
    }
    if (this.state.organizationChosenSubDomainSavedValue !== nextState.organizationChosenSubDomainSavedValue) {
      // console.log('this.state.organizationChosenSubDomainSavedValue', this.state.organizationChosenSubDomainSavedValue, ', nextState.organizationChosenSubDomainSavedValue', nextState.organizationChosenSubDomainSavedValue);
      return true;
    }
    if (this.state.radioGroupValue !== nextState.radioGroupValue) {
      return true;
    }

    const priorOrganization = this.state.organization;
    const nextOrganization = nextState.organization;

    const priorWeVoteChosenDomainNameString = priorOrganization.chosen_domain_string || '';
    const nextWeVoteChosenDomainNameString = nextOrganization.chosen_domain_string || '';
    const priorWeVoteChosenSubDomainString = priorOrganization.chosen_sub_domain_string || '';
    const nextWeVoteChosenSubDomainString = nextOrganization.chosen_sub_domain_string || '';

    if (priorWeVoteChosenDomainNameString !== nextWeVoteChosenDomainNameString) {
      // console.log('priorWeVoteChosenDomainNameString', priorWeVoteChosenDomainNameString, ', nextWeVoteChosenDomainNameString', nextWeVoteChosenDomainNameString);
      return true;
    }
    if (priorWeVoteChosenSubDomainString !== nextWeVoteChosenSubDomainString) {
      // console.log('priorWeVoteChosenSubDomainString', priorWeVoteChosenSubDomainString, ', nextWeVoteChosenSubDomainString', nextWeVoteChosenSubDomainString);
      return true;
    }
    // console.log('shouldComponentUpdate false');
    return false;
  }

  componentWillUnmount () {
    this.organizationStoreListener.remove();
    this.voterStoreListener.remove();
  }

  onOrganizationStoreChange () {
    const { organizationChosenDomainNameChangedLocally, organizationChosenSubDomainChangedLocally, organizationWeVoteId } = this.state;
    const organization = OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId);
    const organizationChosenSubDomainSavedValue = organization.chosen_sub_domain_string || '';
    const organizationChosenDomainNameSavedValue = organization.chosen_domain_string || '';
    this.setState({
      organization,
      organizationChosenDomainNameSavedValue,
      organizationChosenSubDomainSavedValue,
    });
    // If it hasn't been changed locally, then use the one saved in the API server
    if (!organizationChosenDomainNameChangedLocally) {
      this.setState({
        organizationChosenDomainName: organizationChosenDomainNameSavedValue || '',
      });
    }
    // If it hasn't been changed locally, then use the one saved in the API server
    if (!organizationChosenSubDomainChangedLocally) {
      this.setState({
        organizationChosenSubDomain: organizationChosenSubDomainSavedValue || '',
      });
    }
    if (!organizationChosenDomainNameChangedLocally && !organizationChosenSubDomainChangedLocally) {
      // If neither name has been changed, switch to the Domain Name input box
      if (organizationChosenDomainNameSavedValue && organizationChosenDomainNameSavedValue !== '') {
        this.setState({
          radioGroupValue: 'domainNameRadioButtonSelected',
        });
      }
    }
  }

  onVoterStoreChange () {
    const { organizationChosenDomainNameChangedLocally, organizationChosenSubDomainChangedLocally } = this.state;
    const voter = VoterStore.getVoter();
    const voterIsSignedIn = voter.is_signed_in;
    const organizationWeVoteId = voter.linked_organization_we_vote_id;
    const organization = OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId);
    const organizationChosenSubDomainSavedValue = organization.chosen_sub_domain_string || '';
    const organizationChosenDomainNameSavedValue = organization.chosen_domain_string || '';
    this.setState({
      organization,
      organizationChosenDomainNameSavedValue,
      organizationChosenSubDomainSavedValue,
      organizationWeVoteId,
      voter,
      voterIsSignedIn,
    });
    // If it hasn't been changed locally, then use the one saved in the API server
    if (!organizationChosenDomainNameChangedLocally) {
      this.setState({
        organizationChosenDomainName: organizationChosenDomainNameSavedValue || '',
      });
    }
    // If it hasn't been changed locally, then use the one saved in the API server
    if (!organizationChosenSubDomainChangedLocally) {
      this.setState({
        organizationChosenSubDomain: organizationChosenSubDomainSavedValue || '',
      });
    }
  }

  handleOrganizationChosenSubDomainChange = (event) => {
    const { organizationChosenSubDomain } = this.state;
    // console.log('handleOrganizationChosenSubDomainChange, organizationChosenSubDomain: ', organizationChosenSubDomain);
    // console.log('handleOrganizationChosenSubDomainChange, event.target.value: ', event.target.value);
    if (event.target.value !== organizationChosenSubDomain) {
      this.setState({
        organizationChosenSubDomain: event.target.value || '',
        organizationChosenSubDomainChangedLocally: true,
      });
    }
  }

  handleOrganizationChosenDomainNameChange = (event) => {
    const { organizationChosenDomainName } = this.state;
    // console.log('handleOrganizationChosenDomainNameChange, organizationChosenDomainName: ', organizationChosenDomainName);
    // console.log('handleOrganizationChosenDomainNameChange, event.target.value: ', event.target.value);
    if (event.target.value !== organizationChosenDomainName) {
      this.setState({
        organizationChosenDomainName: event.target.value || '',
        organizationChosenDomainNameChangedLocally: true,
      });
    }
  }

  handleRadioGroupChange = (event) => {
    // console.log('handleRadioGroupChange');
    const { radioGroupValue } = this.state;
    if (radioGroupValue !== event.target.value) {
      this.setState({
        radioGroupValue: event.target.value || '',
      });
    }
  }

  handleRadioGroupChoiceSubDomain = () => {
    // console.log('handleRadioGroupChoiceSubDomain');
    const { radioGroupValue } = this.state;
    if (radioGroupValue !== 'subDomainRadioButtonSelected') {
      this.setState({
        radioGroupValue: 'subDomainRadioButtonSelected',
      });
    }
  }

  handleRadioGroupChoiceDomainName = () => {
    // console.log('handleRadioGroupChoiceDomainName');
    const { radioGroupValue } = this.state;
    if (radioGroupValue !== 'domainNameRadioButtonSelected') {
      this.setState({
        radioGroupValue: 'domainNameRadioButtonSelected',
      });
    }
  }

  onCancelDomainNameButton = () => {
    // console.log('onCancelDomainNameButton');
    const { organizationChosenDomainNameSavedValue } = this.state;
    this.setState({
      organizationChosenDomainName: organizationChosenDomainNameSavedValue || '',
      organizationChosenDomainNameChangedLocally: false,
    });
  }

  onCancelSubDomainButton = () => {
    // console.log('onCancelSubDomainButton');
    const { organizationChosenSubDomainSavedValue } = this.state;
    this.setState({
      organizationChosenSubDomain: organizationChosenSubDomainSavedValue || '',
      organizationChosenSubDomainChangedLocally: false,
    });
  }

  onSaveDomainNameButton = (event) => {
    // console.log('onSaveDomainNameButton');
    const { organizationChosenDomainName, organizationWeVoteId } = this.state;
    OrganizationActions.organizationChosenDomainNameSave(organizationWeVoteId, organizationChosenDomainName);
    this.setState({
      organizationChosenDomainNameChangedLocally: false,
    });
    event.preventDefault();
  }

  onSaveSubDomainButton = (event) => {
    // console.log('onSaveSubDomainButton');
    const { organizationChosenSubDomain, organizationWeVoteId } = this.state;
    OrganizationActions.organizationChosenSubDomainSave(organizationWeVoteId, organizationChosenSubDomain);
    this.setState({
      organizationChosenSubDomainChangedLocally: false,
    });
    event.preventDefault();
  }

  openPaidAccountUpgradeModal (paidAccountUpgradeMode) {
    // console.log('SettingsDomain openPaidAccountUpgradeModal');
    AppActions.setShowPaidAccountUpgradeModal(paidAccountUpgradeMode);
  }

  render () {
    // console.log('SettingsDomain render');
    renderLog(__filename);
    const {
      organizationChosenDomainName, organizationChosenDomainNameChangedLocally,
      organizationChosenSubDomain, organizationChosenSubDomainChangedLocally,
      organizationWeVoteId, voter, voterIsPremium, voterIsSignedIn, radioGroupValue,
    } = this.state;
    if (!voter || !organizationWeVoteId) {
      return LoadingWheel;
    }

    const { classes } = this.props;

    if (!voterIsSignedIn) {
      // console.log('voterIsSignedIn is false');
      return <SettingsAccount />;
    }

    return (
      <div>
        <Helmet title="Domain Settings" />
        <div className="card">
          <div className="card-main">
            <h1 className="h2">Domain</h1>
            <FormControl classes={{ root: classes.formControl }}>
              <RadioGroup
                name="domainInput"
                value={radioGroupValue}
                onChange={this.handleRadioGroupChange}
              >
                <InputBoxLabel>
                  We Vote Sub Domain
                </InputBoxLabel>
                <FormControlLabel
                  classes={radioGroupValue === 'subDomainRadioButtonSelected' ? { root: classes.formControlLabel, label: classes.label } : { root: classes.formControlLabelDisabled, label: classes.label }}
                  value="subDomainRadioButtonSelected"
                  control={<Radio color="primary" classes={{ root: classes.radioButton }} />}
                  label={(
                    <IconInputContainer>
                      <i className="fas fa-globe-americas" />
                      <InputBase
                        classes={{ root: classes.inputBase, input: classes.inputItem }}
                        onChange={this.handleOrganizationChosenSubDomainChange}
                        placeholder="Type Sub Domain of WeVote.US..."
                        value={organizationChosenSubDomain || ''}
                      />
                      <SubDomainExtensionText>
                        .WeVote.US
                      </SubDomainExtensionText>
                    </IconInputContainer>
                  )}
                  onClick={this.handleRadioGroupChoiceSubDomain}
                  checked={radioGroupValue === 'subDomainRadioButtonSelected'}
                />
                {radioGroupValue === 'subDomainRadioButtonSelected' && (
                  <ButtonsContainer>
                    <Button
                      classes={{ root: classes.button }}
                      color="primary"
                      disabled={!organizationChosenSubDomainChangedLocally}
                      onClick={this.onCancelSubDomainButton}
                      variant="outlined"
                    >
                      Cancel
                    </Button>
                    <Button
                      color="primary"
                      disabled={!organizationChosenSubDomainChangedLocally}
                      onClick={this.onSaveSubDomainButton}
                      variant="contained"
                    >
                      Save
                    </Button>
                  </ButtonsContainer>
                )}
                <Separator />
              </RadioGroup>
            </FormControl>
            <FormControl classes={{ root: classes.formControl }}>
              <RadioGroup
                name="domainInput"
                value={radioGroupValue}
                onChange={this.handleRadioGroupChange}
              >
                <InputBoxLabel>
                  <span>Custom Domain</span>
                  <SettingsAccountLevelChip userAccountLevel="free" featureAccountLevel="pro" />
                </InputBoxLabel>
                <InputBoxHelperLabel>
                  If you already own a domain, enter it here. Empty it to disconnect.
                </InputBoxHelperLabel>
                <FormControlLabel
                  classes={radioGroupValue === 'domainNameRadioButtonSelected' ? { root: classes.formControlLabel, label: classes.label } : { root: classes.formControlLabelDisabled, label: classes.label }}
                  value="domainNameRadioButtonSelected"
                  control={<Radio color="primary" classes={{ root: classes.radioButton }} />}
                  label={(
                    <IconInputContainer>
                      <i className="fas fa-globe-americas" />
                      <InputBase
                        classes={{ root: classes.inputBase, input: classes.inputItem }}
                        onChange={this.handleOrganizationChosenDomainNameChange}
                        placeholder="Type Domain..."
                        value={organizationChosenDomainName || ''}
                      />
                    </IconInputContainer>
                  )}
                  checked={radioGroupValue === 'domainNameRadioButtonSelected'}
                  onClick={this.handleRadioGroupChoiceDomainName}
                />
                {radioGroupValue === 'domainNameRadioButtonSelected' && (
                  <ButtonsContainer>
                    <Button
                      classes={{ root: classes.button }}
                      color="primary"
                      disabled={!organizationChosenDomainNameChangedLocally}
                      onClick={this.onCancelDomainNameButton}
                      variant="outlined"
                    >
                      Cancel
                    </Button>
                    <PremiumableButton
                      premium={voterIsPremium ? 1 : 0}
                      onClick={voterIsPremium ? this.onSaveDomainNameButton : () => this.openPaidAccountUpgradeModal('professional')}
                    >
                      {voterIsPremium ? 'Save' : 'Upgrade to Professional'}
                    </PremiumableButton>
                  </ButtonsContainer>
                )}
              </RadioGroup>
            </FormControl>
          </div>
        </div>
      </div>
    );
  }
}

const styles = () => ({
  formControl: {
    width: '100%',
  },
  formControlLabel: {
    border: '1.1px solid rgba(0, 0, 0, 0.45)',
    width: '100%',
    borderRadius: '3px',
    margin: 0,
    height: 55.4,
  },
  formControlLabelDisabled: {
    width: '100%',
    border: '1.1px solid rgba(0, 0, 0, 0.45)',
    borderRadius: '3px',
    margin: 0,
    height: 55.4,
  },
  label: {
    width: '100%',
  },
  inputBase: {
    border: 'none',
    background: 'none',
    width: '100%',
    height: '55.4px',
    marginLeft: 12,
    fontSize: 14,
    flex: '1 0 0',
  },
  inputItem: {
    height: '55.4px',
    width: '100%',
  },
  radioButton: {
    width: 55.4,
    height: 55.4,
    padding: 12,
    pointerEvents: 'auto',
  },
  button: {
    marginRight: 8,
  },
  goldButton: {
    background: 'linear-gradient(70deg, rgba(219,179,86,1) 14%, rgba(162,124,33,1) 94%)',
    color: 'white',
  },
});

const IconInputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  border-left: 1px solid rgba(0, 0, 0, 0.45);
  padding-left: 12px;
  color: rgba(0, 0, 0, 0.54);
  height: 100%;
  width: 100%;
`;

const InputBoxLabel = styled.h4`
  font-weight: bold;
  font-size: 13px; 
`;

const InputBoxHelperLabel = styled.p`
  margin: 0;
  font-size: 11px;
  margin-bottom: 4px;
  margin-top: -4px;
`;

const SubDomainExtensionText = styled.h5`
  margin: 0;
  height: 53.4px;
  border-left: 1px solid rgba(0, 0, 0, 0.45);
  background-color: #eee;
  color: rgba(0, 0, 0, 0.45);
  width: fit-content;
  padding: 16px 8px 0;
  border-bottom-right-radius: 3px;
  border-top-right-radius: 3px;
  pointer: none;
`;

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: fit-content;
  width: 100%;
  margin-top: 12px;
`;

const Separator = styled.div`
  width: 100%;
  height: 2px;
  background: #f7f7f7;
  margin: 16px 0;
`;

export default withStyles(styles)(SettingsDomain);
