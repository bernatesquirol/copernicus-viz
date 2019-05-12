  /// my-map-controller.js
  import {MapController} from 'react-map-gl';

  export default class Controller extends MapController {
    constructor(props) {
      super(props);

      this.onClick = props.onClick
      // subscribe to additional events
      this.events = ['click'];
    }

    // Override the default handler in MapController
    handleEvent(event) {
      if (event.type === 'click') {
        if (this.onClick)this.onClick(event.center)
      }
      return super.handleEvent(event);
    }
  }