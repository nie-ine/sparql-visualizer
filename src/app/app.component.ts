import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { Title } from '@angular/platform-browser'; // To override title
import 'codemirror/mode/turtle/turtle';

import { QueryService } from './services/query.service';
import { DataService, TabsData, ProjectData } from './services/data.service';
import { StardogService } from './services/stardog.service';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ QueryService, StardogService ]
})
export class AppComponent implements OnInit {

  private queryResult;
  private resultFieldExpanded: boolean = false;
  public tabIndex: number;
  public showJSON: boolean = false;
  public editDescription: boolean = false; // true if in edit mode
  public newDescription: string; // Holds description changes
  public tabTitles: string[];
  public data: TabsData;
  public projectData: ProjectData;
  public queryType: string;
  public reasoning: boolean;
  public queryTime: number;
  public textOnly: boolean;
  public dataOnly: boolean = false; // Feature to be implemented
  public fullScreen: boolean = false;
  public githubLink: string;

  public loading: boolean;
  public loadingMessage: string;

  // Triplestore can easily be disabled
  public triplestoreOption: boolean = true;

  // Toggle store
  public localStore: boolean = true;
  public toggleTooltip: string = 'Switch to triplestore';

  nieOntologies = [
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/agent-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/atharvaveda-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/catholic-orders-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/catholic-organization-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/concept-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/datatypes-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/delille-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/device-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/dietrich-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/document-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/event-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/human-geography-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/human-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/image-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/indology-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/information-carrier-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/kuno-raeber-gui-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/kuno-raeber-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/language-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/lavater-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/letter-corresponding-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/linguistic-morphology-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/linguistics-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/literature-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/logic-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/mathematics-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/meyer-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/nietzsche-ontology.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/note-structure-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/organization-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/parzival-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/philosophies-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/philosophy-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/physical-entity-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/physical-geography-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/prosodic-structure-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/publishing-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/scholarly-editing-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/scholasticism-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/teaching-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/text-editing-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/text-expression-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/text-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/text-structure-ontology-knora.ttl',
    'https://raw.githubusercontent.com/nie-ine/Ontologies-shared/master/nie-ontologies_shared/woelfflin-ontology-knora.ttl'
  ];

  // Codemirror
  cmConfig = { 
    lineNumbers: true,
    firstLineNumber: 1,
    lineWrapping: true,
    matchBrackets: true,
    mode: 'text/turtle'
  };

  chosenOntology: string;

  hidden: false;

  constructor(
    private _qs: QueryService,
    private _ds: DataService,
    private _ss: StardogService,
    private route: ActivatedRoute,
    public snackBar: MatSnackBar,
    private titleService: Title,
    public http: HttpClient
  ) {}

  ngOnInit(){
    
    this.route.queryParams.subscribe(map => {
      // If a tab is specified, use this. Else default to first tab
      this.tabIndex = map.tab ? parseInt(map.tab) : 0;

      // If triplestore mode is defined, use this
      this.localStore = map.local == 0 ? false : true;
      
      // Get tab titles
      this._ds.getTabTitles().subscribe(res => this.tabTitles = res);

      // Get project data
      this._ds.getProjectData().subscribe(res => {
        this.projectData = res;
        // Change page title
        this.titleService.setTitle(this.projectData.title);
      });

      this.changeTab(this.tabIndex);
    });

    // Inject shared services
    this._ds.loadingStatus.subscribe(loading => this.loading = loading);
    this._ds.loadingMessage.subscribe(msg => this.loadingMessage = msg);
  }
  
  changeMsg(){
    this._ds.setLoadingMessage("Loading triples in store");
  }

  doQuery(){
    var query = this.data.query;
    const data = this.data.triples;

    // If no prefix is defined in the query, get it from the turtle file
    if(query.toLowerCase().indexOf('prefix') == -1){

      query = this._qs.appendPrefixesToQuery(query, data);
      this.data.query = query;

    }

    // Get the query type
    this.queryType = this._qs.getQuerytype(query);

    // If in localstore mode
    if(this.localStore){
      this.queryLocalstore(query,data);
    }
    // If in triplestore mode
    else{
      this.queryTriplestore(query);
    }

  }

  log(ev){
    console.log(ev);
  }

  queryLocalstore(query,data){
    if(this.reasoning){

      // Show loader
      this._ds.setLoadingMessage("Performing query using Hylar");
      this._ds.setLoaderStatus(true);

      // Query Hylar based endpoint
      this._qs.doHylarQuery(query,data)
        .subscribe(res => {
          this.queryResult = res;
          this.resultFieldExpanded = true;
          this._ds.setLoaderStatus(false);
        }, err => {
          this._ds.setLoaderStatus(false);
          this.queryResult = '';
          if(err.indexOf("undefined") != -1){
            this.showSnackbar("The query did not return any results", 10000);
          }
          if(err.message && err.name){
            this.showSnackbar(err.name+': '+err.message, 10000);
          }
        });
    }else{
      // Perform query with client based rdfstore
      this._qs.doQuery(query,data)
        .then(res => {
          this.queryResult = res;
          this.resultFieldExpanded = true;
          console.log(res);
        }).catch(err => {
          this.queryResult = '';
          if(err.message && err.name){
            if(err.indexOf("undefined") != -1){
              this.showSnackbar("The query did not return any results", 10000);
            }
            this.showSnackbar(err.name+': '+err.message, 10000);
          }
        });
    }
  }

  queryTriplestore(query){
    var t1 = Date.now();
    this._ss.query(query,this.reasoning)
      .subscribe(res => {
        // show error if status 200 was not recieved
        if(res.status != '200'){

          if(res.body && res.body.message){
            this.showSnackbar(res.body.code+': '+res.body.message, 10000);
          }else{
            this.showSnackbar(res.status+': '+res.statusText);
          }

        }else{
          var dt = Date.now()-t1;
          this.queryTime = dt;

          // Get body content
          var data = res.body;

          if(data == null){
            // If it's an update query, it will not return a result. Just show snackbar
            this.showSnackbar("Query successful");

          // If it's a select query, just return the result as it is
          }else if(this.queryType == 'select'){
            this.queryResult = data;
            this.resultFieldExpanded = true;
          
          // If it's a construct query, parse it first
          }else{

            // To parse the result to the correct format, we run a query on it
            var query = "CONSTRUCT WHERE {?s ?p ?o}";
            this._qs.doQuery(query,data)
              .then(res => {
                if(res.length == 0){
                  this.queryResult = null;
                  this.showSnackbar("Query returned no results. Did you load the correct dataset?");
                }else{
                  this.queryResult = res;
                  this.resultFieldExpanded = true;
                }
              }, err => console.log(err));
          }
        }
    
      }, err => {
        this.showSnackbar("Something went wrong");
      });
  }

  resetTriples(){
    this._ds.getSingle(this.tabIndex)
        .subscribe(x => {
            this.data.triples = x.triples;
        });
  }

  toggleStore(){
    this.localStore = this.localStore == false ? true : false;
    this.toggleTooltip = this.toggleTooltip == 'Switch to datasets' ? 'Switch to triplestore' : 'Switch to datasets';
  }

  changeTab(i){
    if(i == 'new'){
      console.log('Add new dataset');
    }else{
      this.tabIndex = i;
      this._ds.getSingle(i)
        .subscribe(x => {

          console.log( this.data );
            this.data = x;

            // Use reasoning if the JSON says so
            this.reasoning = x.reasoning ? x.reasoning : false;

            // Hide triples, query and result tab if setting textOnly is true
            this.textOnly = x.textOnly ? x.textOnly : false;;

            // Perform the query if the tab has a query assigned
            if(this.data.query){
              this.doQuery();
              console.log( 'Do query' );
            }else{
              this.queryResult = null;
            }
        });
    }
  }

  tableClick(URI){
    if(this.localStore){
      var query = `SELECT * WHERE {\n\tBIND(<${URI}> AS ?el)\n\t?el ?key ?value\n}`;
    }else{
      var query = `SELECT *\nWHERE {\n\tBIND(<${URI}> AS ?el)\n\tOPTIONAL { \n\t\tGRAPH ?graph {\n\t\t\t?el ?key ?value .\n\t\t}\n\t}\n\tOPTIONAL { ?el ?key ?value . }\n}`;
    }
    this.data.query = query;
    this.doQuery();
  }

  toggleView(ev){
    console.log(ev)
  }

  graphClick(URI){
    console.log(URI);
  }

  showSnackbar(message, duration?){
    if(!duration) duration = 2000
    this.snackBar.open(message, 'close', {
      duration: duration,
    });
  }

  saveDescription(){
    // If changes received
    if(this.newDescription){
      this.data.description = this.newDescription;
    }
    this.editDescription = false;
  }

  update(ev){
    console.log(ev);
  }

  getOntologies( ontology?: string) {
    this.chosenOntology = ontology || this.githubLink;
    this.http.get<any>(ontology || this.githubLink )
      .subscribe(
        data => {
          console.log( data );
        },
        error1 => {
          console.log( error1 );
          console.log( error1.error.text );
          this.data.triples = error1.error.text;
          this.reasoning = false;
          this.textOnly = false;
          this.data.query = "CONSTRUCT WHERE {?s ?p ?o}";
          this.queryResult = null;
          this.doQuery();
        }
      );
  }

}
