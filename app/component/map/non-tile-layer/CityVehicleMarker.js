import PropTypes from 'prop-types';
import React from 'react';
import { routerShape } from 'found';
import Icon from '../../Icon';
import GenericMarker from '../GenericMarker';
import {
  BIKEAVL_UNKNOWN,
  getCityBikeNetworkConfig,
  getCityBikeNetworkIcon,
  getCityBikeNetworkId,
  getCitybikeCapacity,
} from '../../../util/vehicleRentalUtils';
import { isBrowser } from '../../../util/browser';
import {
  getCityVehicleAvailabilityIndicatorColor,
  getVehicleAvailabilityTextColor,
} from '../../../util/legUtils';

import { PREFIX_BIKESTATIONS } from '../../../util/path';

let L;

/* eslint-disable global-require */
// TODO When server side rendering is re-enabled,
//      these need to be loaded only when isBrowser is true.
//      Perhaps still using the require from webpack?
if (isBrowser) {
  L = require('leaflet');
}
/* eslint-enable global-require */

// Small icon for zoom levels <= 15
const smallIconSvg = `
  <svg viewBox="0 0 8 8">
    <circle class="stop-small" cx="4" cy="4" r="3" stroke-width="1"/>
  </svg>
`;

export default class CityVehicleMarker extends React.Component {
  static displayName = 'CityVehicleMarker';

  static propTypes = {
    showBikeAvailability: PropTypes.bool,
    station: PropTypes.object.isRequired,
    transit: PropTypes.bool,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
    router: routerShape.isRequired,
  };

  static defaultProps = {
    showBikeAvailability: false,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
    router: routerShape.isRequired,
  };

  handleClick() {
    const { stationId } = this.props.station;
    this.context.router.push(
      `/${PREFIX_BIKESTATIONS}/${encodeURIComponent(stationId)}`,
    );
  }

  getIcon = zoom => {
    const { showBikeAvailability, station, transit } = this.props;
    const { config } = this.context;
    const citybikeCapacity = getCitybikeCapacity(config, station.network);
    const iconName = `${getCityBikeNetworkIcon(
      getCityBikeNetworkConfig(getCityBikeNetworkId(station.network), config),
    )}-lollipop`;

    return !transit && zoom <= config.stopsSmallMaxZoom
      ? L.divIcon({
          html: smallIconSvg,
          iconSize: [8, 8],
          className: 'citybike cursor-pointer',
        })
      : L.divIcon({
          iconAnchor: [15, 40],
          html: showBikeAvailability
            ? Icon.asString({
                img: iconName,
                className: 'city-bike-medium-size',
                badgeFill: getCityVehicleAvailabilityIndicatorColor(
                  station.vehiclesAvailable,
                  config,
                ),
                badgeTextFill: getVehicleAvailabilityTextColor(
                  station.vehiclesAvailable,
                  config,
                ),
                badgeText:
                  citybikeCapacity !== BIKEAVL_UNKNOWN
                    ? station.vehiclesAvailable
                    : null,
              })
            : Icon.asString({
                img: iconName,
                className: 'city-bike-medium-size',
              }),
          iconSize: [20, 20],
          className: 'citybike cursor-pointer',
        });
  };

  render() {
    if (!isBrowser) {
      return false;
    }
    return (
      <GenericMarker
        position={{
          lat: this.props.station.lat,
          lon: this.props.station.lon,
        }}
        onClick={this.handleClick}
        getIcon={this.getIcon}
        id={this.props.station.stationId}
      />
    );
  }
}
