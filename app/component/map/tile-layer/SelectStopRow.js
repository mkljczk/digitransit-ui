import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import Link from 'found/Link';
import { graphql, fetchQuery, ReactRelayContext } from 'react-relay';
import Icon from '../../Icon';
import { PREFIX_TERMINALS, PREFIX_STOPS } from '../../../util/path';

function isNull(val) {
  return val === 'null' || val === undefined || val === null;
}

const stopTypeQuery = graphql`
  query SelectStopRowTypeQuery($id: String!) {
    stop: stop(id: $id) {
      routes {
        type
      }
    }
  }
`;

function SelectStopRow(
  { gtfsId, type, name, code, terminal, desc, colors, relayEnvironment },
  { config },
) {
  const [mode, setMode] = useState(type);
  useEffect(() => {
    if (type === 'BUS' && config.useExtendedRouteTypes) {
      fetchQuery(relayEnvironment, stopTypeQuery, { id: gtfsId }).then(
        results => {
          if (results.stop.routes.some(r => r.type === 702)) {
            setMode('bus-express');
          }
        },
      );
    }
  }, []);
  const iconOptions = {};
  switch (mode) {
    case 'TRAM,BUS':
      iconOptions.iconId = 'icon-icon_bustram-stop-lollipop';
      iconOptions.className = 'tram-stop';
      break;
    case 'TRAM':
      iconOptions.iconId = terminal
        ? 'icon-icon_tram'
        : 'icon-icon_tram-stop-lollipop';
      iconOptions.className = 'tram-stop';
      break;
    case 'RAIL':
      iconOptions.iconId = terminal
        ? 'icon-icon_rail'
        : 'icon-icon_rail-stop-lollipop';
      iconOptions.className = 'rail-stop';
      break;
    case 'BUS':
      iconOptions.iconId = terminal
        ? 'icon-icon_bus'
        : 'icon-icon_bus-stop-lollipop';
      iconOptions.className = 'bus-stop';
      break;
    case 'bus-express':
      iconOptions.iconId = terminal
        ? 'icon-icon_bus'
        : 'icon-icon_bus-stop-express-lollipop';
      iconOptions.className = 'bus-stop';
      break;
    case 'SUBWAY':
      iconOptions.iconId = 'icon-icon_subway';
      iconOptions.className = 'subway-stop';
      break;
    case 'FERRY':
      iconOptions.iconId = !isNull(code)
        ? 'icon-icon_ferry'
        : 'icon-icon_stop_ferry';
      iconOptions.className = 'ferry-stop';
      if (iconOptions.iconId === 'icon-icon_stop_ferry') {
        iconOptions.color = colors.iconColors['mode-ferry-pier'];
      }
      break;
    case 'AIRPLANE':
      iconOptions.iconId = 'icon-icon_airplane';
      break;
    default:
      iconOptions.iconId = 'icon-icon_bus';
      break;
  }

  const showDesc = desc && desc !== 'null';
  const showCode = code && code !== 'null';

  const prefix = terminal ? PREFIX_TERMINALS : PREFIX_STOPS;
  return (
    <Link
      className="stop-popup-choose-row"
      to={`/${prefix}/${encodeURIComponent(gtfsId)}`}
    >
      <span className="choose-row-left-column" aria-hidden="true">
        <Icon
          className={iconOptions.className}
          img={iconOptions.iconId}
          color={iconOptions.color || null}
        />
      </span>
      <span className="choose-row-center-column">
        <h5 className="choose-row-header">{name}</h5>
        {(showDesc || showCode) && (
          <span className="choose-row-text">
            {showDesc && <span className="choose-row-address">{desc}</span>}
            {showCode && <span className="choose-row-number">{code}</span>}
          </span>
        )}
      </span>
      <span className="choose-row-right-column">
        <Icon img="icon-icon_arrow-collapse--right" />
      </span>
    </Link>
  );
}

const withRelay = props => (
  <ReactRelayContext.Consumer>
    {({ environment }) => (
      <SelectStopRow {...props} relayEnvironment={environment} />
    )}
  </ReactRelayContext.Consumer>
);

SelectStopRow.displayName = 'SelectStopRow';

SelectStopRow.propTypes = {
  gtfsId: PropTypes.string.isRequired,
  relayEnvironment: PropTypes.object,
  type: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  code: PropTypes.string,
  desc: PropTypes.string,
  terminal: PropTypes.bool,
  colors: PropTypes.object,
};

SelectStopRow.defaultProps = {
  terminal: false,
  code: null,
  desc: null,
};

SelectStopRow.contextTypes = {
  config: PropTypes.shape({
    useExtendedRouteTypes: PropTypes.bool.isRequired,
  }).isRequired,
};

export { withRelay as default, SelectStopRow as Component };
