// import CodeMirror from 'codemirror';
// import 'codemirror/lib/codemirror.css';
// import 'codemirror/mode/python/python';
// import 'font-awesome/css/font-awesome.css';
import { WidgetManager } from './manager';

import { Kernel, KernelMessage } from '@jupyterlab/services';

// let BASEURL = prompt('Notebook BASEURL', 'http://localhost:8888');
// let WSURL =
//   'ws:' +
//   BASEURL.split(':')
//     .slice(1)
//     .join(':');

document.addEventListener('DOMContentLoaded', function(event) {
  // Connect to the notebook webserver.
  //   let connectionInfo = ServerConnection.makeSettings({
  //     baseUrl: BASEURL,
  //     wsUrl: WSURL
  //   });
  if (!(document as any).Kernel) {
    console.log('Started now getting out of here');
    return;
  }
  console.log('Oops');
  try {
    const kernel: Kernel.IKernel = (document as any).getKernel();
    // JupyterKernel.getSpecs(connectionInfo).then(kernelSpecs => {
    //     return JupyterKernel.startNew({
    //         name: kernelSpecs.default,
    //         serverSettings: connectionInfo
    //     });
    // }).then(kernel => {

    // Create a codemirror instance
    // let code = require('../widget_code.json').join('\n');
    // let inputarea = document.getElementsByClassName('inputarea')[0] as HTMLElement;
    // CodeMirror(inputarea, {
    //     value: code,
    //     mode: 'python',
    //     tabSize: 4,
    //     showCursorWhenSelecting: true,
    //     viewportMargin: Infinity,
    //     readOnly: true
    // });
    // Create the widget area and widget manager
	let widgetarea = document.getElementsByClassName('widgetarea')[0] as HTMLElement;
	console.log(widgetarea ? 'has widget area' : 'no widget area');
    let manager = new WidgetManager(kernel, widgetarea);
	console.log('Created widget manager');

    // Run backend code to create the widgets.  You could also create the
    // widgets in the frontend, like the other widget examples demonstrate.
    // let execution = kernel.requestExecute({ code: code });
    // execution.onIOPub = (msg) => {
		// const onIOPub: ((msg: KernelMessage.IIOPubMessage) => void | PromiseLike<void>) = (document as any).onIOPub;
		(document as any).onIOPub = (msg: KernelMessage.IIOPubMessage) => {
			console.log('Got iopub message');
      // If we have a display message, display the widget.
      if (KernelMessage.isDisplayDataMsg(msg)) {
		  console.log('Yes is display message');
		  debugger;
        let widgetData: any = msg.content.data['application/vnd.jupyter.widget-view+json'];
        if (widgetData !== undefined && widgetData.version_major === 2) {
          let model = manager.get_model(widgetData.model_id);
          if (model !== undefined) {
            model.then(model => {
              manager.display_model(msg, model);
            });
          }
        }
      }
	};
	console.log('Initialized');
  } catch (ex) {
    console.error('Error in ipywidget', ex);
  }
  // });
});
