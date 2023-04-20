export function respondWithHtml({
	count,
	query,
	sort,
	start
} :{
	count :number|string
	query :string
	sort :string
	start :number|string
}) :{
		body :string
		contentType :string
} {
	return {
		body: `<html>
	<head>
		<title>Documents Endpoint - Version 1 - API documentation</title>
		<style>
			table {
				border: 1px solid black;
				border-collapse: collapse;
			}
			tr, th, td {
				border: 1px solid black;
			}
			th, td {
				padding: 1em;
			}
			.pre {
				white-space: pre;
			}
			details {
				border: 1px solid black;
				border-radius: 4px;
				margin: 6px;
				padding: 6px;
			}
			.method-get span,
			.method-post span,
			.method-delete span {
				border-radius: 3px;
				color: white;
				display: inline-block;
				font-size: 14px;
	    		font-weight: 700;
				min-width: 80px;
				padding: 6px 15px;
				text-align: center;
			}
			.method-get {
				background-color: lightblue;
				border-color: blue;
			}
			.method-get span {
				background-color: blue;
			}
			.method-post {
				background-color: lightgreen;
				border-color: green;
			}
			.method-post span {
				background-color: green;
			}
			.method-delete {
				background-color: #ffcccb;
				border-color: red;
			}
			.method-delete span {
				background-color: red;
			}
			samp {
				background-color: black;
				color: white;
				display: block;
				margin: 6px;
				padding: 6px;
				white-space: pre;
			}
		</style>
		<script>
			function IsJsonString(str) {
				try {
					JSON.parse(str);
				} catch (e) {
					return false;
				}
				return true;
			}

			function myGet(event) {
				//console.log('event', event);
				event.preventDefault();

				const params = {};

				var getCount = document.getElementById('getCount').value;
				if (getCount) {
					params.count = getCount;
				}

				var getFilters = document.getElementById('getFilters').value;

				if(getFilters) {
					var filtersJson = "{}";
					if (IsJsonString(getFilters)) {
						filtersJson = getFilters;
					} else {
						eval('var js = ' + getFilters);
						//console.log('js', js);
						filtersJson = JSON.stringify(js);
						//console.log('filtersJson', filtersJson);
					}
					params.filters = filtersJson;
				}

				var getStart = document.getElementById('getStart').value;
				if (getStart) {
					params.start = getStart;
				}

				var getQuery = document.getElementById('getQuery').value;
				if (getQuery) {
					params.query = getQuery;
				}

				var getSort = document.getElementById('getSort').value;
				if (getSort) {
					params.sort = getSort;
				}

				var nodeList = document.querySelectorAll('[name=getId]'); // Dynamic
				//console.debug('nodeList', nodeList);
				//var array = Array.prototype.slice.call(nodeList); // Static
				var array = Array.from(nodeList); // Static
				//console.debug('array', array);
				let ids;
				if (array.length) {
					ids = array
						.filter((el) => el.value)
						.map((el) => \`id=\${el.value}\`).join('&');
					//console.debug('ids', ids);
				}

				//console.log('params', params);

				let urlQuery = Object.keys(params).map((k) => \`\${k}=\${params[k]}\`).join('&');
				if (ids) {
					urlQuery = \`\${urlQuery}&\${ids}\`;
				}
				//console.debug('urlQuery', urlQuery);

				fetch(\`?\${urlQuery}\`, {
					//body: filtersJson, // TypeError: Failed to execute 'fetch' on 'Window': Request with GET/HEAD method cannot have body.
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					method: 'GET'
				});/*.then(data => {
					console.log(data);
				});*/

				return false;
			}

			function myPost(event) {
				//console.log('event', event);
				event.preventDefault();

				const params = {};

				var requireValidFalse = document.getElementById('requireValidFalse').checked;
				//console.log('requireValidFalse', requireValidFalse);
				if (requireValidFalse) {
					params.requireValid = 'false';
				}

				var partialTrue = document.getElementById('partialTrue').checked;
				//console.log('partialTrue', partialTrue);
				if (partialTrue) {
					params.partial = 'true';
				}

				let urlQuery = Object.keys(params).map((k) => \`\${k}=\${params[k]}\`).join('&');

				var jsStr = document.getElementById('js').value;
				//console.log('jsStr', jsStr);

				var json = "{}";
				if (IsJsonString(jsStr)) {
					json = jsStr;
				} else {
					eval('var js = ' + jsStr);
					//console.log('js', js);
					json = JSON.stringify(js);
					//console.log('json', json);
				}

				fetch(\`?\${urlQuery}\`, {
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					body: json,
					method: 'POST'
				});/*.then(data => {
					console.log(data);
				});*/

				return false;
			}

			function myDelete(event) {
				//console.log('event', event);
				event.preventDefault();

				var nodeList = document.querySelectorAll('[name=deleteId]'); // Dynamic
				//console.debug('nodeList', nodeList);
				//var array = Array.prototype.slice.call(nodeList); // Static
				var array = Array.from(nodeList); // Static
				//console.debug('array', array);
				let deleteIds;
				if (array.length) {
					deleteIds = array
						.filter((el) => el.value)
						.map((el) => \`id=\${el.value}\`).join('&');
					//console.debug('deleteIds', deleteIds);
				}

				fetch(\`?\${deleteIds}\`, {
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					method: 'DELETE'
				});/*.then(data => {
					console.log(data);
				});*/

				return false;
			}
		</script>
	</head>
	<body>
		<h1>API documentation</h1>

		<details class="method-get">
			<summary><span>GET</span> <b>/api/v1/documents</b> Get documents</summary>
			<h2>Headers</h2>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Value</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th>Accept</th>
						<td>application/json</td>
					</tr>
					<tr>
						<th>authorization</th>
						<td>explorer-api-key XXXX</td>
						<td>The API key (password) for the collection you want to get documents from.</td>
					</tr>
					<tr>
						<th>Content-Type</th>
						<td>application/json</td>
					</tr>
				</tbody>
			</table>

			<h2>Parameters</h2>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Attributes</th>
						<th>Default</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th>id</th>
						<td>&lt;optional&gt;</td>
						<td></td>
						<td>Id of document to get. May supply multiple. Will be converted into a query filter on the serverside.</td>
					</tr>

					<tr>
						<th>count</th>
						<td>&lt;optional&gt;</td>
						<td>10</td>
						<td>How many documents to get. Limited to between 1 and 100.</td>
					</tr>

					<tr>
						<th>start</th>
						<td>&lt;optional&gt;</td>
						<td>0</td>
						<td>Start index (used for paging).</td>
					</tr>

					<tr>
						<th>filters</th>
						<td>&lt;optional&gt;</td>
						<td></td>
						<td>Query filters. See <a href="https://developer.enonic.com/docs/xp/stable/storage/filters">documentation</a>.</td>
					</tr>

					<tr>
						<th>query</th>
						<td>&lt;optional&gt;</td>
						<td></td>
						<td>Query expression. Keep in mind that filters are usually more quicker. See <a href="https://developer.enonic.com/docs/xp/stable/storage/noql">documentation</a>.</td>
					</tr>

					<tr>
						<th>sort</th>
						<td>&lt;optional&gt;</td>
						<td>score DESC</td>
						<td>Sorting expression.</td>
					</tr>

				</tbody>
			</table>
			<p>If no id, filter or query provided it will simply return a (paginated) list of documents.</p>

			<h2>Example response</h2>
			<samp>[{
	_id: 'existing_id'
	field: 'value'
}]</samp>

			<h2>GET Form (XHR)</h2>
			<form autocomplete="off" method="GET" novalidate onsubmit="return myGet(event)">
				<dl>
					<dt><label for="getId">Id</label></dt>
					<dd><input name="getId" placeholder="" size="80" type="text" value=""/></dd>
					<dd><input name="getId" placeholder="" size="80" type="text" value=""/></dd>
					<dd><input name="getId" placeholder="" size="80" type="text" value=""/></dd>
					<dd><input name="getId" placeholder="" size="80" type="text" value=""/></dd>
					<dd><input name="getId" placeholder="" size="80" type="text" value=""/></dd>
					<dd><input name="getId" placeholder="" size="80" type="text" value=""/></dd>
					<dd><input name="getId" placeholder="" size="80" type="text" value=""/></dd>
					<dd><input name="getId" placeholder="" size="80" type="text" value=""/></dd>
					<dd><input name="getId" placeholder="" size="80" type="text" value=""/></dd>
					<dd><input name="getId" placeholder="" size="80" type="text" value=""/></dd>

					<dt><label for="getStart">Start</label></dt>
					<dd><input id="getStart" name="getStart" type="number" value="${start}"/></dd>

					<dt><label for="getCount">Count</label></dt>
					<dd><input id="getCount" name="getCount" type="number" value="${count}"/></dd>

					<dt><label for="getFilters">Filters</label></dt>
					<dd><textarea cols="173" id="getFilters" name="getFilters" rows="16">{
	boolean: {
		must: {
			exists: {
				field: 'url'
			}
		}
	},
	ids: {
		values: [
			'fb0abbd1-cd15-4b01-8528-345d0668fa6b',
			'26ab2ea6-de00-4605-88fc-894c3b4c932d'
		]
	}
}</textarea></dd>

					<dt><label for="getQuery">Query</label></dt>
					<dd><input id="getQuery" name="getQuery" placeholder="if provided keys ignored" size="80" type="text" value="${query}"/></dd>

					<dt><label for="getSort">Sort</label></dt>
					<dd><input id="getSort" name="getSort" placeholder="optionial" size="80" type="text" value="${sort}"/></dd>
				</dl>
				<input type="submit" value="GET">
			</form>
		</details>

		<details class="method-post">
			<summary><span>POST</span> <b>/api/v1/documents</b> Create or modify documents</summary>
			<h2>Headers</h2>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Value</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th>Accept</th>
						<td>application/json</td>
					</tr>
					<tr>
						<th>authorization</th>
						<td>explorer-api-key XXXX</td>
						<td>The API key (password) for the collection you want to get documents from.</td>
					</tr>
					<tr>
						<th>Content-Type</th>
						<td>application/json</td>
					</tr>
				</tbody>
			</table>

			<h2>Parameters</h2>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Attributes</th>
						<th>Default</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th>requireValid</th>
						<td>&lt;optional&gt;</td>
						<td>true</td>
						<td>The data has to be valid, according to the field types, to be created or updated. If requireValid=true and the data is not strictly valid, an error will be returned.</td>
					</tr>
					<tr>
						<th>partial</th>
						<td>&lt;optional&gt;</td>
						<td>false</td>
						<td>When true, values are only added or updated. Unprovided values are not removed.</td>
					</tr>
				</tbody>
			</table>

			<h2>body</h2>
			<p>Javascript object or array of objects, or json of the same</p>
			<table>
				<thead>
					<tr>
						<th>Type</th>
						<th>Data</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th>JSON of javascript object</th>
						<td class="pre">{
	"text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
	"title":"Hello World",
	"uri":"https://www.example.com"
}</td>
					</tr>
					<tr>
						<th>JSON of javascript array of objects</th>
						<td class="pre">[
	{
		"text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
		"title":"The standard Lorem Ipsum passage, used since the 1500s",
		"uri":"https://www.example.com"
	},
	{
		"text":"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?",
		"title":"Section 1.10.32 of \\"de Finibus Bonorum et Malorum\\", written by Cicero in 45 BC",
		"uri":"https://www.iana.org/"
	}
]</td>
					</tr>
				</tbody>
			</table>

			<h2>Example responses</h2>
			<samp>[{
	_id: 'created_id'
},{
	_id: 'modified_id',
},{
	error: 'Something went wrong when trying to create the document!'
},{
	error: 'Something went wrong when trying to modify the document!'
}]</samp>

			<h2>POST Form Create or modify (XHR)</h2>
			<form autocomplete="off" method="POST" novalidate onsubmit="return myPost(event)">
				<dl>
					<dt>Require valid</dt>
					<dd>
						<input checked="checked" id="requireValidTrue" name="requireValid" type="radio" value="true"/>
						<label for="requireValidTrue">True</label>
						<input id="requireValidFalse" name="requireValid" type="radio" value="false"/>
						<label for="requireValidFalse">False</label>
					</dd>

					<dt>Partial</dt>
					<dd>
						<input id="partialTrue" name="partial" type="radio" value="true"/>
						<label for="partialTrue">True</label>
						<input checked="checked" id="partialFalse" name="partial" type="radio" value="false"/>
						<label for="partialFalse">False</label>
					</dd>

					<dt><label for="js">Javascript object or array of objects, or json of the same</label></dt>
					<dd><textarea cols="173" id="js" name="js" rows="14">[{
	available: true,
	count: -999999999999999,
	date: '2021-01-01',
	datetime: '2021-01-01T00:00:00',
	instant: '2021-01-01T00:00:00Z',
	location: '59.9090442,10.7423389',
	//price: -9.9999999999999999,
	price: -999999999999999.9,
	time: '00:00:00',
	language: 'english',
	text: 'This domain is for use in illustrative examples in documents. You may use this domain in literature without prior coordination or asking for permission.',
	title: 'Example Domain',
	url: 'https://www.example.com'
},{
	available: false,
	count: 999999999999999,
	date: '2021-12-31',
	datetime: '2021-12-31T23:59:59',
	instant: '2021-12-31T23:59:59Z',
	location: [
		59.9090442,
		10.7423389
	],
	//price: 9.9999999999999999,
	price: 999999999999999.9,
	time: '23:59:59',
	language: 'english',
	text: 'Whatever',
	title: 'Whatever',
	url: 'https://www.whatever.com'
}]</textarea></dd>
				<input type="submit" value="POST">
			</form>
		</details>

		<details class="method-delete">
			<summary><span>DELETE</span> <b>/api/v1/documents</b> Delete documents</summary>
			<h2>Headers</h2>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Value</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th>Accept</th>
						<td>application/json</td>
					</tr>
					<tr>
						<th>authorization</th>
						<td>explorer-api-key XXXX</td>
						<td>The API key (password) for the collection you want to get documents from.</td>
					</tr>
					<tr>
						<th>Content-Type</th>
						<td>application/json</td>
					</tr>
				</tbody>
			</table>

			<h2>Parameters</h2>
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Attributes</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<th>id</th>
						<td>&lt;required&gt;</td>
						<td>Id of document to delete. May supply multiple.</td>
					</tr>
				</tbody>
			</table>

			<h2>Example response</h2>
			<samp>[{
	_id: 'existing_id'
},{
	_id: 'non_existant_id',
	error: 'Unable to find document with key = non_existant_id!'
}]</samp>
			<h2>DELETE Form (XHR)</h2>
			<form autocomplete="off" method="DELETE" novalidate onsubmit="return myDelete(event)">
				<dl>
					<dt><label for="deleteId">Id</label></dt>
					<dd><input name="deleteId" placeholder="" size="80" type="text" value=""/></dd>
					<dd><input name="deleteId" placeholder="" size="80" type="text" value=""/></dd>
					<dd><input name="deleteId" placeholder="" size="80" type="text" value=""/></dd>
					<dd><input name="deleteId" placeholder="" size="80" type="text" value=""/></dd>
					<dd><input name="deleteId" placeholder="" size="80" type="text" value=""/></dd>
					<dd><input name="deleteId" placeholder="" size="80" type="text" value=""/></dd>
					<dd><input name="deleteId" placeholder="" size="80" type="text" value=""/></dd>
					<dd><input name="deleteId" placeholder="" size="80" type="text" value=""/></dd>
					<dd><input name="deleteId" placeholder="" size="80" type="text" value=""/></dd>
					<dd><input name="deleteId" placeholder="" size="80" type="text" value=""/></dd>
				</dl>
				<input type="submit" value="DELETE">
			</form>
		</details>
	</body>
</html>`,
		contentType: 'text/html;charset=utf-8'
	};
} // respondWithHtml
