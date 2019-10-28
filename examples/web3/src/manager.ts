import * as base from '@jupyter-widgets/base';
import * as pWidget from '@phosphor/widgets';

import {
  Kernel
} from '@jupyterlab/services';

import {
    HTMLManager
} from '@jupyter-widgets/html-manager';

import './widgets.css';
import { DOMWidgetView } from '@jupyter-widgets/base';

const cdn = 'https://unpkg.com/';

function moduleNameToCDNUrl(moduleName: string, moduleVersion: string) {
    let packageName = moduleName;
    let fileName = 'index'; // default filename
    // if a '/' is present, like 'foo/bar', packageName is changed to 'foo', and path to 'bar'
    // We first find the first '/'
    let index = moduleName.indexOf('/');
    if ((index != -1) && (moduleName[0] == '@')) {
        // if we have a namespace, it's a different story
        // @foo/bar/baz should translate to @foo/bar and baz
        // so we find the 2nd '/'
        index = moduleName.indexOf('/', index+1);
    }
    if (index != -1) {
        fileName = moduleName.substr(index+1);
        packageName = moduleName.substr(0, index);
    }
    return `${cdn}${packageName}@${moduleVersion}/dist/${fileName}`;
}

let requirePromise = function(pkg: string | string[]): Promise<any> {
    return new Promise((resolve, reject) => {
        let require = (window as any).requirejs;
        if (require === undefined) {
            reject("Requirejs is needed, please ensure it is loaded on the page.");
        } else {
            require(pkg, resolve, reject);
        }
    });
}

function requireLoader(moduleName: string, moduleVersion: string) {
	console.log(`Falling back to ${cdn} for ${moduleName}@${moduleVersion}`);
	let require = (window as any).requirejs;
	if (require === undefined) {
		throw new Error("Requirejs is needed, please ensure it is loaded on the page.");
	}
	const conf: {paths: {[key: string]: string}} = {paths: {}};
	conf.paths[moduleName] = moduleNameToCDNUrl(moduleName, moduleVersion);
	require.config(conf);

	return requirePromise([`${moduleName}`]);
}
export
class WidgetManager extends HTMLManager {
    constructor(kernel: Kernel.IKernelConnection, el: HTMLElement) {
        super({loader: requireLoader});
        this.kernel = kernel;
        this.el = el;

        kernel.registerCommTarget(this.comm_target_name, async (comm, msg) => {
            let oldComm = new base.shims.services.Comm(comm);
            await this.handle_comm_open(oldComm, msg);
        });
    }
	protected loadClass(className: string, moduleName: string, moduleVersion: string): Promise<any>{
		debugger;
		return super.loadClass(className, moduleName, moduleVersion).catch(ex => {
			console.error('wow', ex);
			debugger;
			return requireLoader(moduleName, moduleVersion).catch(ex=>{
				console.error('wow again', ex);
				debugger;
				return Promise.reject(ex);
			})
			// return new Promise((resolve, reject)=>{
			// 	window.require([`https://unpkg.com/${moduleName}@${moduleVersion}/dist/index.js`], resolve, reject);
			// }).then(function(mod:any) {
			// 	if (mod[className]) {
			// 		return mod[className];
			// 	} else {
			// 		return Promise.reject(`Class ${className} not found in module ${moduleName}@${moduleVersion}`);
			// 	}
			// });
		})
	}
    display_view(msg: any, view: DOMWidgetView, options: any) {
        return Promise.resolve(view).then((view) => {
            pWidget.Widget.attach(view.pWidget, this.el);
            view.on('remove', function() {
                console.log('view removed', view);
            });
            return view;
        });
    }

    /**
     * Create a comm.
     */
    async _create_comm(target_name: string, model_id: string, data?: any, metadata?: any): Promise<base.shims.services.Comm> {
            let comm = await this.kernel.connectToComm(target_name, model_id);
            if (data || metadata) {
                comm.open(data, metadata);
            }
            return Promise.resolve(new base.shims.services.Comm(comm));
        }

    /**
     * Get the currently-registered comms.
     */
    _get_comm_info(): Promise<any> {
        return this.kernel.requestCommInfo({target: this.comm_target_name}).then(reply => (reply.content as any).comms);
    }

    kernel: Kernel.IKernelConnection;
    el: HTMLElement;
}
