import PropTypes from 'prop-types';
import { LiaMoneyBillWaveAltSolid } from 'react-icons/lia'

const Logo = ({ className }) => {
  return (
    <LiaMoneyBillWaveAltSolid className={className} />
  )
}

Logo.propTypes = {
  className: PropTypes.string.isRequired,
};

export default Logo;
