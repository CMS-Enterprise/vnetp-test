import {environment} from 'src/environments/environment';
export class HelpText {
    wikiBase = environment.wikiBase;
    solaris_cdom_clone_text = `Clone resources from previously configured host.  More info ${this.wikiBase}/solaris#CDOM_Create`;
}
