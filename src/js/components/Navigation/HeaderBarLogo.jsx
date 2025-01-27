import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router';
import { cordovaDot, isCordova } from '../../utils/cordovaUtils';
import logoLight from '../../../img/global/svg-icons/we-vote-logo-horizontal-color-200x66.svg';
import logoDark from '../../../img/global/svg-icons/we-vote-logo-horizontal-color-dark-141x46.svg';

const HeaderBarLogo = ({ isBeta, light }) => (
  <HeaderBarWrapper>
    <Link to={`${isCordova() ? '/ballot' : '/welcome'}`} className="page-logo page-logo-full-size" id="logoHeaderBar">
      {/* <img */}
      {/*  className="header-logo-img" */}
      {/*  alt="We Vote logo" */}
      {/*  src={cordovaDot(`/img/global/svg-icons/we-vote-logo-horizontal-color${light ? '-200x66' : '-dark-141x46'}.svg`)} */}
      {/* /> */}
      <img
        className="header-logo-img"
        alt="We Vote logo"
        src={light ? cordovaDot(logoLight) : cordovaDot(logoDark)}
      />
      {isBeta && <span className="beta-marker"><BetaMarkerInner light={light}>beta</BetaMarkerInner></span>}
    </Link>
  </HeaderBarWrapper>
);

HeaderBarLogo.propTypes = {
  isBeta: PropTypes.bool,
  light: PropTypes.bool,
};

const BetaMarkerInner = styled.span`
  position: absolute;
  font-size: 10px;
  right: 0;
  top: 18px;
  color: ${({ light }) => (light ? 'white' : '#2e3c5d')}
  text-transform:
`;

const HeaderBarWrapper = styled.div`
  @media print{
  }
`;
export default HeaderBarLogo;
