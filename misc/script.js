//ZMIENNE GLOBALNE
var SCR_nr = 0;		//(STRING) ID aktualnie wyświetlanego screena
var ROUND_nr = 0;	//(INT) nr aktualnej rundy
var TIMER;			//(INT) czas pozostały na udzielenie odpowiedzi (w sekundach)
var TIMER_SET = 60;	//(INT) maksymalny czas na odpowiedź (w sekundach)
var INTERVAL;		//ID funkcji czasowej setInterval()
let myBlob;
		
//Tworzenie listy pytań i inicjowanie gry
function gameStart() {
		document.getElementById("odpowiedzi").innerHTML = ODP_HTML;
		var ilosc_screenow = document.getElementById("odpowiedzi").getElementsByClassName("scr").length;
		//generowanie listy screenów
		for (i=1; i<=ilosc_screenow; i++) {
			//tworzenie elementu listy screenów do wyboru
			var node = document.createElement("LI");
			var id = i.toString().padStart(2, '0');
			node.id = id;
			node.textContent = id;
			node.onclick = function(){pokazScreena(this)};
			document.getElementById("screeny").appendChild(node);
			
			//randomizowanie listy screenów
			var odp_length = document.getElementById("odpowiedzi").getElementsByClassName("scr").length;
			var rand_index = Math.floor(Math.random()*odp_length);
			var scr_losowy = document.getElementById("odpowiedzi").getElementsByClassName("scr")[rand_index];
			document.getElementById("odpowiedzi_losowe").appendChild(scr_losowy);
		}
		//usuwanie przycisku startu, żeby nie klikać ponownie bez potrzeby
		var przycisk = document.getElementById("start");
		przycisk.parentNode.removeChild(przycisk);
		//ustawienie pierwszej drużyny jako aktywnej
		if(document.getElementsByClassName("team").length < 1) addTeam("Testerzy");
		switchTeam(document.getElementsByClassName("team")[0]);
		nextRound();
}

//Ustawianie maksymalnego czasu na odpowiedź
function setTimer(t)
{
	czas = parseInt(t, 10);
	if(czas > 0) {
		TIMER_SET = czas;
		document.getElementById("time").textContent = TIMER_SET;
	}
}

//Dekrementacja licznika czasu
function timer()
{
	TIMER += -1;
	document.getElementById("timer").textContent = TIMER;
	if(TIMER <= 0){	//gdy czas się skończy
		document.getElementById("modal").style.backgroundImage = "none";	//ukrywanie screena
		clearInterval(INTERVAL);	//wyłączanie funkcji czasowej
	}
}
//Dodawanie drużyny
function addTeam(name)
{
	if(name != null && name.length > 0 && name.length <= 28) {	
		//tworzenie obiektów
		var team = document.createElement("TR");
		var team_nr = document.createElement("TD");
		var team_name = document.createElement("TD");
		var team_score = document.createElement("TD");
		var team_buttons = document.createElement("TD");
		
		//tworzenie przycisków
		var mns = document.createElement("BUTTON");
		var pls = document.createElement("BUTTON");
		var del = document.createElement("BUTTON");
		var act = document.createElement("BUTTON");
		
		//przypisywanie numeru drużynie
		var nr;
		if(document.getElementsByClassName("team").length > 0) {
			var t = document.getElementsByClassName("team")[document.getElementsByClassName("team").length - 1];
			var n = t.getElementsByClassName("nr")[0].textContent;
			nr = parseInt(n, 10)+1;
		} else nr = 1;
		team_nr.textContent = nr + ".";
		//przypisywanie nazwy drużyny
	//	var name = prompt("Podaj nazwę drużyny:"); //gdyby nie było parametru
		team_name.textContent = name;
		//przypisywanie wyniku
		team_score.textContent = 0;
		
		//dodawanie zawartości (tekstu) przycisków
		mns.textContent = "-";
		pls.textContent = "+";
		del.textContent = "X";
		act.textContent = "<>";
		
		//przypisywanie funkcji przyciskom
		mns.setAttribute("onclick", "modifyScore(this.parentNode.parentNode, -1)"); //!!
		pls.setAttribute("onclick", "modifyScore(this.parentNode.parentNode, 1)"); //!!
		del.setAttribute("onclick", "deleteTeam(this.parentNode.parentNode)");
		act.setAttribute("onclick", "switchTeam(this.parentNode.parentNode)");
		
		//przypisywanie klas obiektom
		team.classList.add("team");
		team_nr.classList.add("nr");
		team_name.classList.add("name");
		team_score.classList.add("score");
		
		//strukturyzacja
		team_buttons.appendChild(mns);
		team_buttons.appendChild(pls);
		team_buttons.appendChild(del);
		team_buttons.appendChild(act);
		
		team.appendChild(team_nr);
		team.appendChild(team_name);
		team.appendChild(team_score);
		team.appendChild(team_buttons);
		
		document.getElementById("team_table").appendChild(team);
		
		
		//logowanie dodania drużyny
		loguj("addTeam", team);
	}
}

//Usuwanie drużyny
function deleteTeam(team)
{
	var tname = team.getElementsByClassName("name")[0].textContent;
	var tnr = team.getElementsByClassName("nr")[0].textContent;
	if(confirm("Na pewno chcesz USUNĄĆ drużynę " + tnr + " '" + tname + "'?")) {
		loguj("deleteTeam", team);
//		if(team.classList.contains("current")) switchTeam("auto");
		team.parentNode.removeChild(team);
		for(i = 0; i < document.getElementsByClassName("team").length; i++)
			document.getElementsByClassName("team")[i].getElementsByClassName("nr")[0].textContent = (i+1) + ".";
	}
}

//Zmiana aktywnej drużyny
function switchTeam(team)
{
	if(team === "auto") {
		var team = document.getElementsByClassName("current team")[0];
		var nextTeam = document.getElementsByClassName("current team")[0].nextElementSibling;
		if (nextTeam == null) {
		nextTeam = team.parentNode.getElementsByClassName("team")[0];
		nextRound();
		}
		team.classList.remove("current");
		nextTeam.classList.add("current");
	} else {
		if(team.classList.contains("current"))
			team.classList.remove("current");
		else {
			while(document.getElementsByClassName("current team").length > 0){
				document.getElementsByClassName("current team")[0].classList.remove("current");
			}
		team.classList.add("current");
		}
	}
}

//Mieszanie kolejności drużyn
function shuffleTeams()
{
	var table = document.getElementById("team_table");
	var teams = document.getElementsByClassName("team");
	var n = teams.length;
	var teams_new = [];
	for(i = 0; i < n; i++){
		var rand = Math.floor(Math.random()*teams.length);
		teams_new[i] = teams[rand].innerHTML;
		table.removeChild(teams[rand]);
	}
	for(i=0; i<n; i++) {
		var team = document.createElement("TR");
		team.innerHTML = teams_new[i];
		team.classList.add("team");
		team.getElementsByClassName("nr")[0].textContent = (i+1) + ".";
		table.appendChild(team);
	}
}

//Zmiana rundy
function nextRound()
{
		ROUND_nr++;
		if(document.getElementsByClassName("team").length > 0){
			shuffleTeams();
			switchTeam(document.getElementsByClassName("team")[0]);
		}
//		alert("RUNDA " + ROUND_nr + ".");
		loguj("nextRound");
}

//Wyświetlanie klikniętego screena
function pokazScreena(scr_li)
{
	if(!scr_li.classList.contains("niema")/* || confirm("BYŁO! Kontynuować?")*/) {
		var n = document.getElementsByClassName("current team").length;
		if(n == 1 || confirm("Brak aktywnej drużyny! Kontynuować?")) {
			document.getElementById("odp_box").style.display = "none";	//ukrywanie kontenera z odpowiedzią
			clearInterval(INTERVAL);	//czyszczenie stopera;
				//resetowanie stanu stopera
			//ustawianie adresu pliku obrazka tła modala (screena)
			SCR_nr = scr_li.id;	
			var odpowiedzi = document.getElementById("odpowiedzi_losowe");
			var scr = odpowiedzi.getElementsByClassName("scr")[SCR_nr-1];
			if(scr.getElementsByClassName("title").length == 1)
				var sciezka = scr.getElementsByClassName("path")[0].textContent;
			else	var sciezka = "misc/logo.png";	//BRAK PLIKU OBRAZKA SCREENA
			var adres = "url('" + sciezka + "')";
			var modal = document.getElementById("modal");
			modal.style.backgroundImage = adres;	//ustawienie obrazka jako tła modala
			
			//dodawanie podpisu statusu na górze
			
			var podpis = document.getElementById("podpis");
			var tnr;
			var tname;
			var snr;
			
			if(document.getElementsByClassName("current team").length == 1) {
				tnr = document.getElementsByClassName("current team")[0].getElementsByClassName("nr")[0].textContent;
				tname = document.getElementsByClassName("current team")[0].getElementsByClassName("name")[0].textContent;
			} else {
				tnr = "0.";
				tname = "brak";
			}
			
			podpis.textContent = "Runda: " + ROUND_nr + ".	|	Drużyna: " + tnr + " " + tname + "	|	Screen: " + SCR_nr;
			
			TIMER = TIMER_SET;
			document.getElementById("timer").textContent = TIMER;
			INTERVAL = setInterval(timer, 1000);
			
			modal.style.display = "block";			//wyświetlenie modala
		//	scr_li.classList.add("bylo");			//oznaczenie pytania, że było już pokazane
		}
	}
}

function closeModal() {
	//czyszczenie i zamykanie odpowiedzi
	while(document.getElementById("odp_box").getElementsByClassName("title").length > 0)
		document.getElementById("odp_box").removeChild(modal.getElementsByClassName("title")[0]);
	document.getElementById("odp_box").style.display = "none";
	//czyszczenie podpisu
	document.getElementById("podpis").textContent = null;
	//czyszczenie i zamykanie modala
	document.getElementById("modal").style.backgroundImage = "none";
	document.getElementById("modal").style.display = "none";
	console.clear(); //czyszczenie konsoli
	clearInterval(INTERVAL);	//zatrzymywanie stopera
	TIMER = TIMER_SET; //resetowanie stopera
}

//Wyświetlenie odpowiedzi w konsoli i pokazanie przycisków
function pokazOdp()
{
	//czyszczenie wcześniej wyświetlanych odpowiedzi
	while(document.getElementById("odp_box").getElementsByClassName("title").length > 0)
				document.getElementById("odp_box").removeChild(modal.getElementsByClassName("title")[0]);
	
	//sprawdzam czy screen ma wprowadzoną odpowiedź
	if(document.getElementById("odpowiedzi_losowe").getElementsByClassName("scr")[SCR_nr-1].getElementsByClassName("title").length == 1) {
		var scr = document.getElementById("odpowiedzi_losowe").getElementsByClassName("scr")[SCR_nr-1];
		var odp = scr.getElementsByClassName("title")[0];
		//aby odpowiedź była wyświetlana dla wszystkich, należy dodać:
		//document.getElementById("odp_box").appendChild(odp.cloneNode(true));
		console.clear();	//czyszczenie konsoli
		for(i = 0; i < odp.children.length; i++) {
			console.log(odp.children[i].textContent); //wyświetlanie odpowiedzi w konsoli
		}
	}

	toggle(document.getElementById("odp_box")); //przełączanie widoczności bloku z przyciskami (i ew. odpowiedzią)
	clearInterval(INTERVAL); //zatrzymywanie licznika czasu
}


function answer(odp)	//udzielenie odpowiedzi
{
	var team = document.getElementsByClassName("current team");
	var screen = document.getElementById(SCR_nr);
	if(team != null && team.length == 1) {
		var pkt;
		switch(odp) {
			case "right":
				if(screen.classList.contains("bylo"))
					pkt = 1;
				else pkt = 2;
				screen.classList.add("niema");
				break;
			case "wrong":
				if(screen.classList.contains("bylo"))
					pkt = -1;
				else pkt = 0;
				screen.classList.add("bylo");
				break;
			default: 
		}
		modifyScore(team[0], pkt);	//dodaj punkty
		loguj("odpowiedz", pkt);	//dodaj wpis w logu
		closeModal();	//zamknij i wyczyść modal
		switchTeam("auto");	//zmień drużynę na następną
	}
}

function modifyScore(team, pkt)	//modyfikacja wyniku drużyny
{
	var score = parseInt(team.getElementsByClassName("score")[0].textContent)+pkt;
	team.getElementsByClassName("score")[0].textContent = score;
}

function loguj(aktywnosc, x)	//dodawanie wpisu w logu gry
{
	var now = new Date();
	var time = now.toLocaleTimeString();
	p = document.createElement("P");
	p.classList.add("logentry");
	
	switch(aktywnosc) {
		case "addTeam":	//dodanie drużyny o nazwie x
			var tname = x.getElementsByClassName("name")[0].textContent; //chcemy z ucinaniem za długich...
			p.textContent = time + " > Drużyna '" + tname + "' dołączyła do gry.";
			break;
		case "deleteTeam":	//usunięcie drużyny x
			var tnr = x.getElementsByClassName("nr")[0].textContent;
			var tname = x.getElementsByClassName("name")[0].textContent;
			p.textContent = time + " > Drużyna " + tnr + " '" + tname + "' opuściła grę";
			break;
		case "odpowiedz":	//udzielenie odpowiedzi za x punktów
			p.textContent = time + " > " + document.getElementById("podpis").textContent + "	|	" + (x<=0?"":"+") + x + " pkt.";
			if(x > 0) p.style.color = "green";
			else if(x < 0) p.style.color = "red";
			break;
		case "nextRound":	//info o kolejnej rundzie (kolejka przeszła wszystkie drużyny)
			p.textContent = time + " > RUNDA " + ROUND_nr + ".";
			p.style.color = "blue";
			break;
			
		default:
	}
	
	document.getElementById("log").appendChild(p);
	document.getElementById("log").scrollBy(0, document.getElementById("log").scrollHeight);
}

function toggle(node)	//przełączenie widoczności elementów
{
	if(node.style.display === "none")
		node.style.display = "block";
	else
		node.style.display = "none";
}