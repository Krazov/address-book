!function(e){var a={};function n(o){if(a[o])return a[o].exports;var t=a[o]={i:o,l:!1,exports:{}};return e[o].call(t.exports,t,t.exports,n),t.l=!0,t.exports}n.m=e,n.c=a,n.d=function(e,a,o){n.o(e,a)||Object.defineProperty(e,a,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,a){if(1&a&&(e=n(e)),8&a)return e;if(4&a&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&a&&"string"!=typeof e)for(var t in e)n.d(o,t,function(a){return e[a]}.bind(null,t));return o},n.n=function(e){var a=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(a,"a",a),a},n.o=function(e,a){return Object.prototype.hasOwnProperty.call(e,a)},n.p="",n(n.s=0)}([function(e,a,n){"use strict";n.r(a);const o=(...e)=>(...a)=>e.reduce((e,a,n)=>0===n?a(...e):a(e),a),t={},c=e=>((e,a)=>e.hasOwnProperty(a))(t,e),d=(e,a)=>{c(e)||(t[e]=[]),"function"==typeof a&&t[e].push(a)},r=(e,a)=>{c(e)&&t[e].forEach(e=>{e(a)})},{localStorage:m}=window,i=(e,a)=>{m.setItem(e,a)},s=({lastId:e,addressBook:a})=>{e&&i("last-id",JSON.stringify({value:e})),a&&i("address-book",JSON.stringify(a))},l=(e,a=null)=>(e=>{const a=m.getItem(e);return null!=a?JSON.parse(a):null})(e)||a,u=(e,a)=>new Promise((n,o)=>{const t=new XMLHttpRequest;t.open(e,a),t.onload=function(){this.status>=200&&this.status<300?n(t.response):o({status:this.status,statusText:t.statusText})},t.onerror=function(){o({status:this.status,statusText:t.statusText})},t.send()}),S=e=>document.createRange().createContextualFragment(e);var y=e=>(e=>u("GET",e))(e).then(S),p=[{code:"AF",name:"Afghanistan"},{code:"AX",name:"Åland Islands"},{code:"AL",name:"Albania"},{code:"DZ",name:"Algeria"},{code:"AS",name:"American Samoa"},{code:"AD",name:"Andorra"},{code:"AO",name:"Angola"},{code:"AI",name:"Anguilla"},{code:"AQ",name:"Antarctica"},{code:"AG",name:"Antigua and Barbuda"},{code:"AR",name:"Argentina"},{code:"AM",name:"Armenia"},{code:"AW",name:"Aruba"},{code:"AU",name:"Australia"},{code:"AT",name:"Austria"},{code:"AZ",name:"Azerbaijan"},{code:"BS",name:"Bahamas"},{code:"BH",name:"Bahrain"},{code:"BD",name:"Bangladesh"},{code:"BB",name:"Barbados"},{code:"BY",name:"Belarus"},{code:"BE",name:"Belgium"},{code:"BZ",name:"Belize"},{code:"BJ",name:"Benin"},{code:"BM",name:"Bermuda"},{code:"BT",name:"Bhutan"},{code:"BO",name:"Bolivia, Plurinational State of"},{code:"BQ",name:"Bonaire, Sint Eustatius and Saba"},{code:"BA",name:"Bosnia and Herzegovina"},{code:"BW",name:"Botswana"},{code:"BV",name:"Bouvet Island"},{code:"BR",name:"Brazil"},{code:"IO",name:"British Indian Ocean Territory"},{code:"BN",name:"Brunei Darussalam"},{code:"BG",name:"Bulgaria"},{code:"BF",name:"Burkina Faso"},{code:"BI",name:"Burundi"},{code:"KH",name:"Cambodia"},{code:"CM",name:"Cameroon"},{code:"CA",name:"Canada"},{code:"CV",name:"Cape Verde"},{code:"KY",name:"Cayman Islands"},{code:"CF",name:"Central African Republic"},{code:"TD",name:"Chad"},{code:"CL",name:"Chile"},{code:"CN",name:"China"},{code:"CX",name:"Christmas Island"},{code:"CC",name:"Cocos (Keeling) Islands"},{code:"CO",name:"Colombia"},{code:"KM",name:"Comoros"},{code:"CG",name:"Congo"},{code:"CD",name:"Congo, the Democratic Republic of the"},{code:"CK",name:"Cook Islands"},{code:"CR",name:"Costa Rica"},{code:"CI",name:"Côte d'Ivoire"},{code:"HR",name:"Croatia"},{code:"CU",name:"Cuba"},{code:"CW",name:"Curaçao"},{code:"CY",name:"Cyprus"},{code:"CZ",name:"Czech Republic"},{code:"DK",name:"Denmark"},{code:"DJ",name:"Djibouti"},{code:"DM",name:"Dominica"},{code:"DO",name:"Dominican Republic"},{code:"EC",name:"Ecuador"},{code:"EG",name:"Egypt"},{code:"SV",name:"El Salvador"},{code:"GQ",name:"Equatorial Guinea"},{code:"ER",name:"Eritrea"},{code:"EE",name:"Estonia"},{code:"ET",name:"Ethiopia"},{code:"FK",name:"Falkland Islands (Malvinas)"},{code:"FO",name:"Faroe Islands"},{code:"FJ",name:"Fiji"},{code:"FI",name:"Finland"},{code:"FR",name:"France"},{code:"GF",name:"French Guiana"},{code:"PF",name:"French Polynesia"},{code:"TF",name:"French Southern Territories"},{code:"GA",name:"Gabon"},{code:"GM",name:"Gambia"},{code:"GE",name:"Georgia"},{code:"DE",name:"Germany"},{code:"GH",name:"Ghana"},{code:"GI",name:"Gibraltar"},{code:"GR",name:"Greece"},{code:"GL",name:"Greenland"},{code:"GD",name:"Grenada"},{code:"GP",name:"Guadeloupe"},{code:"GU",name:"Guam"},{code:"GT",name:"Guatemala"},{code:"GG",name:"Guernsey"},{code:"GN",name:"Guinea"},{code:"GW",name:"Guinea-Bissau"},{code:"GY",name:"Guyana"},{code:"HT",name:"Haiti"},{code:"HM",name:"Heard Island and McDonald Islands"},{code:"VA",name:"Holy See (Vatican City State)"},{code:"HN",name:"Honduras"},{code:"HK",name:"Hong Kong"},{code:"HU",name:"Hungary"},{code:"IS",name:"Iceland"},{code:"IN",name:"India"},{code:"ID",name:"Indonesia"},{code:"IR",name:"Iran, Islamic Republic of"},{code:"IQ",name:"Iraq"},{code:"IE",name:"Ireland"},{code:"IM",name:"Isle of Man"},{code:"IL",name:"Israel"},{code:"IT",name:"Italy"},{code:"JM",name:"Jamaica"},{code:"JP",name:"Japan"},{code:"JE",name:"Jersey"},{code:"JO",name:"Jordan"},{code:"KZ",name:"Kazakhstan"},{code:"KE",name:"Kenya"},{code:"KI",name:"Kiribati"},{code:"KP",name:"Korea, Democratic People's Republic of"},{code:"KR",name:"Korea, Republic of"},{code:"KW",name:"Kuwait"},{code:"KG",name:"Kyrgyzstan"},{code:"LA",name:"Lao People's Democratic Republic"},{code:"LV",name:"Latvia"},{code:"LB",name:"Lebanon"},{code:"LS",name:"Lesotho"},{code:"LR",name:"Liberia"},{code:"LY",name:"Libya"},{code:"LI",name:"Liechtenstein"},{code:"LT",name:"Lithuania"},{code:"LU",name:"Luxembourg"},{code:"MO",name:"Macao"},{code:"MK",name:"Macedonia, the Former Yugoslav Republic of"},{code:"MG",name:"Madagascar"},{code:"MW",name:"Malawi"},{code:"MY",name:"Malaysia"},{code:"MV",name:"Maldives"},{code:"ML",name:"Mali"},{code:"MT",name:"Malta"},{code:"MH",name:"Marshall Islands"},{code:"MQ",name:"Martinique"},{code:"MR",name:"Mauritania"},{code:"MU",name:"Mauritius"},{code:"YT",name:"Mayotte"},{code:"MX",name:"Mexico"},{code:"FM",name:"Micronesia, Federated States of"},{code:"MD",name:"Moldova, Republic of"},{code:"MC",name:"Monaco"},{code:"MN",name:"Mongolia"},{code:"ME",name:"Montenegro"},{code:"MS",name:"Montserrat"},{code:"MA",name:"Morocco"},{code:"MZ",name:"Mozambique"},{code:"MM",name:"Myanmar"},{code:"NA",name:"Namibia"},{code:"NR",name:"Nauru"},{code:"NP",name:"Nepal"},{code:"NL",name:"Netherlands"},{code:"NC",name:"New Caledonia"},{code:"NZ",name:"New Zealand"},{code:"NI",name:"Nicaragua"},{code:"NE",name:"Niger"},{code:"NG",name:"Nigeria"},{code:"NU",name:"Niue"},{code:"NF",name:"Norfolk Island"},{code:"MP",name:"Northern Mariana Islands"},{code:"NO",name:"Norway"},{code:"OM",name:"Oman"},{code:"PK",name:"Pakistan"},{code:"PW",name:"Palau"},{code:"PS",name:"Palestine, State of"},{code:"PA",name:"Panama"},{code:"PG",name:"Papua New Guinea"},{code:"PY",name:"Paraguay"},{code:"PE",name:"Peru"},{code:"PH",name:"Philippines"},{code:"PN",name:"Pitcairn"},{code:"PL",name:"Poland"},{code:"PT",name:"Portugal"},{code:"PR",name:"Puerto Rico"},{code:"QA",name:"Qatar"},{code:"RE",name:"Réunion"},{code:"RO",name:"Romania"},{code:"RU",name:"Russian Federation"},{code:"RW",name:"Rwanda"},{code:"BL",name:"Saint Barthélemy"},{code:"SH",name:"Saint Helena, Ascension and Tristan da Cunha"},{code:"KN",name:"Saint Kitts and Nevis"},{code:"LC",name:"Saint Lucia"},{code:"MF",name:"Saint Martin (French part)"},{code:"PM",name:"Saint Pierre and Miquelon"},{code:"VC",name:"Saint Vincent and the Grenadines"},{code:"WS",name:"Samoa"},{code:"SM",name:"San Marino"},{code:"ST",name:"Sao Tome and Principe"},{code:"SA",name:"Saudi Arabia"},{code:"SN",name:"Senegal"},{code:"RS",name:"Serbia"},{code:"SC",name:"Seychelles"},{code:"SL",name:"Sierra Leone"},{code:"SG",name:"Singapore"},{code:"SX",name:"Sint Maarten (Dutch part)"},{code:"SK",name:"Slovakia"},{code:"SI",name:"Slovenia"},{code:"SB",name:"Solomon Islands"},{code:"SO",name:"Somalia"},{code:"ZA",name:"South Africa"},{code:"GS",name:"South Georgia and the South Sandwich Islands"},{code:"SS",name:"South Sudan"},{code:"ES",name:"Spain"},{code:"LK",name:"Sri Lanka"},{code:"SD",name:"Sudan"},{code:"SR",name:"Suriname"},{code:"SJ",name:"Svalbard and Jan Mayen"},{code:"SZ",name:"Swaziland"},{code:"SE",name:"Sweden"},{code:"CH",name:"Switzerland"},{code:"SY",name:"Syrian Arab Republic"},{code:"TW",name:"Taiwan, Province of China"},{code:"TJ",name:"Tajikistan"},{code:"TZ",name:"Tanzania, United Republic of"},{code:"TH",name:"Thailand"},{code:"TL",name:"Timor-Leste"},{code:"TG",name:"Togo"},{code:"TK",name:"Tokelau"},{code:"TO",name:"Tonga"},{code:"TT",name:"Trinidad and Tobago"},{code:"TN",name:"Tunisia"},{code:"TR",name:"Turkey"},{code:"TM",name:"Turkmenistan"},{code:"TC",name:"Turks and Caicos Islands"},{code:"TV",name:"Tuvalu"},{code:"UG",name:"Uganda"},{code:"UA",name:"Ukraine"},{code:"AE",name:"United Arab Emirates"},{code:"GB",name:"United Kingdom"},{code:"US",name:"United States"},{code:"UM",name:"United States Minor Outlying Islands"},{code:"UY",name:"Uruguay"},{code:"UZ",name:"Uzbekistan"},{code:"VU",name:"Vanuatu"},{code:"VE",name:"Venezuela, Bolivarian Republic of"},{code:"VN",name:"Viet Nam"},{code:"VG",name:"Virgin Islands, British"},{code:"VI",name:"Virgin Islands, U.S."},{code:"WF",name:"Wallis and Futuna"},{code:"EH",name:"Western Sahara"},{code:"YE",name:"Yemen"},{code:"ZM",name:"Zambia"},{code:"ZW",name:"Zimbabwe"}],C={},g={};function h(){if(!(this instanceof h))return new h}p.forEach(function(e){C[e.name.toLowerCase()]=e.code,g[e.code.toLowerCase()]=e.name}),h.prototype.getCode=function(e){return C[e.toLowerCase()]},h.prototype.getName=function(e){return g[e.toLowerCase()]},h.prototype.getNames=function(){return p.map(function(e){return e.name})},h.prototype.getCodes=function(){return p.map(function(e){return e.code})},h.prototype.getCodeList=function(){return g},h.prototype.getNameList=function(){return C},h.prototype.getData=function(){return p};var f=new h;const M=/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;const v=l("address-book",{});let b=l("last-id",{value:0}).value;Promise.all([Promise.all([y("/app/view-controllers/list/view.html"),y("/app/view-controllers/list/item.html")]).then(([e,a])=>{const n={},o=e.querySelector(".jsContacts"),t=o.querySelector(".jsNew"),c=o.querySelector(".jsContactsList"),m=(e=>({id:a,name:n,surname:o,country:t,email:c})=>{const d=e.cloneNode(!0);return d.querySelector(".jsName").textContent=`${n} ${o}`,d.querySelector(".jsCountry").textContent=`${t&&f.getName(t)}`,d.querySelector(".jsEmail").textContent=`${c}`,d.querySelector(".jsEdit").customData={contactId:a,action:"edit"},d.querySelector(".jsDelete").customData={contactId:a,action:"delete"},d})(a.children[0]),i=({id:e,name:a,surname:o,country:t,email:d})=>{const r=m({id:e,name:a,surname:o,country:t,email:d});n[e]=r,(e=>{c.appendChild(e)})(r)};return d("init-list",e=>{Object.values(e).forEach(i)}),d("add-to-list",i),d("update-list",({id:e,name:a,surname:o,country:t,email:c})=>{((e,{name:a,surname:n,country:o,email:t})=>{e.querySelector(".jsName").textContent=`${a} ${n}`,e.querySelector(".jsCountry").textContent=`${o&&f.getName(o)}`,e.querySelector(".jsEmail").textContent=`${t}`})(n[e],{name:a,surname:o,country:t,email:c})}),d("remove-from-list",({id:e})=>{c.removeChild(n[e]),delete n[e]}),t.addEventListener("click",()=>{r("new-request",!0)}),c.addEventListener("click",e=>{const{customData:{action:a,contactId:n}={}}=e.target;switch(a){case"edit":(e=>{r("update-request",{id:e})})(n);break;case"delete":(e=>{r("delete-request",{id:e})})(n)}}),e}),y("/app/view-controllers/form-dialog/view.html").then(e=>{const a=e.querySelector(".jsDialog"),n=a.querySelector(".jsTitle"),t=a.querySelector(".jsForm"),c=t.querySelector(".jsNameContainer"),m=t.querySelector(".jsSurnameContainer"),i=t.querySelector(".jsCountryContainer"),s=t.querySelector(".jsEmailContainer"),l=t.querySelector(".jsId"),u=c.querySelector(".jsName"),S=m.querySelector(".jsSurname"),y=i.querySelector(".jsCountry"),p=s.querySelector(".jsEmail"),C=t.querySelector(".jsCancel"),g=e=>()=>{a.classList.toggle("is-active",e)},h=g(!0),v=g(!1),b=e=>()=>{n.textContent=e},I=b("New contact"),N=b("Edit contact"),B=()=>{v(),l.value="",t.reset()},T=(e,a)=>{e.classList.toggle("has-error",a)},G=({name:e,surname:a,country:n,email:o})=>(T(c,!e),T(m,!a),T(i,!n),T(s,!o),{name:e,surname:a,country:n,email:o}),L=((...e)=>(...a)=>{const n=e.length-1;return e.reduceRight((e,a,o)=>o===n?a(...e):a(e),a)})(e=>Object.values(e).every(e=>1==e),G,(e,a,n,o)=>({name:(e=>"string"==typeof e&&e.length>0&&/[\w]+/.test(e.replace(/\d/g,"")))(e),surname:(e=>{if("string"!=typeof e)return!1;const a=e.replace(/\d/g,"");return""===e||/[\w]+/.test(a)})(a),country:(e=>void 0!==f.getName(e))(n),email:(e=>"string"==typeof e&&M.test(e))(o)})),E=o(B,I,h),A=o(({id:e,name:a,surname:n,country:o,email:t})=>{l.value=e,u.value=a,S.value=n,y.value=o,p.value=t},()=>G({name:!0,surname:!0,country:!0,email:!0}),N,h);{const e=f.getCodeList();Object.keys(e).map(a=>((e,a)=>{const n=document.createElement("option");return n.value=e,n.textContent=a,n})(a,e[a])).forEach(e=>{y.appendChild(e)})}return d("new-request",E),d("delete-request",B),d("overlay-clicked",B),d("edit-contact",A),t.addEventListener("submit",e=>{e.preventDefault();const{id:a,name:n,surname:o,country:t,email:c}={id:l.value,name:u.value,surname:S.value,country:y.value,email:p.value};L(n,o,t,c)&&(a?r("update-contact",{id:a,name:n,surname:o,country:t,email:c}):r("new-contact",{name:n,surname:o,country:t,email:c}),B())}),C.addEventListener("click",()=>{B()}),e}),y("/app/view-controllers/delete-dialog/view.html").then(e=>{let a=null;const n=e.querySelector(".jsDialog"),o=n.querySelector(".jsForm"),t=o.querySelector(".jsId"),c=o.querySelector(".jsDetails"),m=o.querySelector(".jsYes"),i=o.querySelector(".jsNo"),s=(e="",a="")=>{t.value=e,c.textContent=(({name:e,surname:a,country:n,email:o})=>`${e} ${a} (${n&&f.getName(n)}), ${o}`)(a)},l=e=>()=>{n.classList.toggle("is-active",e)},u=l(!0),S=l(!1),y=()=>{a=null,o.reset(),s(),S()};return d("delete-contact",({id:e,contact:n})=>{a=e,s(e,n),u()}),d("new-request",S),d("update-request",S),d("overlay-clicked",S),m.addEventListener("click",e=>{e.preventDefault(),r("delete-confirm",{id:a}),y()}),i.addEventListener("click",e=>{e.preventDefault(),y()}),e}),y("/app/view-controllers/overlay/view.html").then(e=>(e.querySelector(".jsOverlay").addEventListener("click",()=>{r("overlay-clicked",!0)}),e))]).then(e=>e.reduce((e,a)=>(e.push(a),e),[])).then(e=>{((e,a)=>{[].forEach.call(a,a=>{e.appendChild(a)})})(document.querySelector(".jsMain"),e)}).then(()=>{r("init-list",v)}),d("new-contact",({name:e,surname:a,country:n,email:o})=>{const t={id:b+=1,name:e,surname:a,country:n,email:o};v[b]=t,s({lastId:b,addressBook:v}),r("add-to-list",t)}),d("update-contact",({id:e,name:a,surname:n,country:o,email:t})=>{v[e]={id:e,name:a,surname:n,country:o,email:t},s({addressBook:v}),r("update-list",{id:e,name:a,surname:n,country:o,email:t})}),d("delete-confirm",({id:e})=>{delete v[e],s({addressBook:v}),r("remove-from-list",{id:e})}),d("delete-request",({id:e})=>{r("delete-contact",{id:e,contact:v[e]})}),d("update-request",({id:e})=>{r("edit-contact",v[e])})}]);
