import clsx from 'clsx';
import PropTypes from 'prop-types';
import { LiaMoneyBillWaveAltSolid } from 'react-icons/lia'

const Logo = ({ variant, text }) => {

  return (
    <div className="flex items-center justify-center space-x-2">
      <LiaMoneyBillWaveAltSolid
        className={clsx({
          "text-gray-900": variant === "dark",
          "text-white": variant === "light",
          "w-8 h-8": text,
          "w-10 h-10": !text,
        })}
      />
      {text ? (<span className={clsx("text-xl font-bold tracking-tight", {
        "text-gray-900": variant === "dark",
        "text-white": variant === "light",
      })}>
        Bidster
      </span>) : null}
    </div>
  )
}

Logo.defaultProps = {
  variant: 'light',
  text: true,
};

Logo.propTypes = {
  variant: PropTypes.oneOf(['light', 'dark']),
  text: PropTypes.bool,
};

export default Logo;
