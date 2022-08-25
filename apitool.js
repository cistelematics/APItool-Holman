/*
We would want the client to be able to input the device serial and get back the below info;

- Device Name 
- Current VIN associated 
- Last Communication Date 
- Last GPS Record Date 
- displayStatus 
- deviceplan 
- ignitionstatus 
- Current Device Location 
- Last Odometer 
- last Odometer Source engine vs GPS

*/


//function that pulls all the information once "submit" button is clicked.
const run = () =>{
  
var disp = false; 

//authenticate user credentials
const authentication = {
credentials:{
  database: document.getElementById("database").value,
  userName: document.getElementById("email").value, 
  password: document.getElementById("password").value  
},
path: document.getElementById("server").value
};

const api= new GeotabApi(authentication);

// if authentication is successful, try loading the data
api.authenticate( success => {
  var x = document.getElementById("login");
  var y = document.getElementById("userinp");
  if (x.style.display === "none" && disp!=false) {
      x.style.display = "block";
    } else {
      x.style.display = "none";
      y.style.display = "block";
      
      let serial= document.getElementById("serial").value;
      
      if (serial != ""){

      api.call("Get", {
        "typeName": "Device",
        search :{
            serialNumber: serial
        }
    }, function(result) {
    
          if (result.length==0){
            alert("wrong input or the input has whitespace before it")
          }

          else{

          //display "Loading Data..." while all the data is loading.
          document.getElementById("loading").innerHTML = "Loading Data..."

        //display the device name (it should always exist)
        document.getElementById("name").innerHTML = "Device Name:"+ result[0].name;

        //display VIN if it exists, else show not found message.
        if (result[0].hasOwnProperty('vehicleIdentificationNumber')){
          document.getElementById("VIN").innerHTML = "Vin Number:"+ result[0].vehicleIdentificationNumber;
        }
        else{
          document.getElementById("VIN").innerHTML = "No VIN found"
        }
        
        api.call("GetDeviceHistory", {"device": {"id": result[0].id}},
        function(res){
        
        
        // display lastServerCommunication if it exists, else show not found message.
        if (res[0].hasOwnProperty('lastServerCommunication')){
          document.getElementById("communication").innerHTML="Last Communication Date:"+(res[0].lastServerCommunication).slice(0,10)+",Time:"+(res[0].lastServerCommunication).slice(11,19);
        }
        else{
          document.getElementById("communication").innerHTML="No Last communication date found"
        }

        // display lastValidGpsRecord if it exists, else show not found message.
        if (res[0].hasOwnProperty('lastValidGpsRecord')){
          document.getElementById("gps").innerHTML="Last GPS Record Date:"+(res[0].lastValidGpsRecord).slice(0,10)+",Time:"+(res[0].lastValidGpsRecord).slice(11,19);
        }
        else{
          document.getElementById("gps").innerHTML="No GPS record found";
        }
        
        // display displayStatus if it exists, else show not found message.
        if (res[0].hasOwnProperty('displayStatus')){
          document.getElementById("display").innerHTML="Last Display Status:"+res[0].displayStatus;
        }
        else{
          document.getElementById("display").innerHTML="No Display Status found"
        }
        
        // display the Device plan if it exists, else show not found message.
        if (res[0].hasOwnProperty('devicePlan')){
          document.getElementById("plan").innerHTML= "Device Plan:"+res[0].devicePlan;
        }
        else{
          document.getElementById("plan").innerHTML="No Device Plan found"
        }

         //remove "Loading Data..." once the data is loaded and displayed.
         document.getElementById("loading").innerHTML="";
         document.getElementById("note").innerHTML="Note- The time in the output is in UTC time zone"

      }
      )

      //current odometer
      const now = new Date(new Date().getTime());
      api.call("Get", {
          "typeName": "StatusData",
          search:{
              "fromDate": now,
              "deviceSearch": {
                      "id": result[0].id
              },
              "diagnosticSearch": {
                      "id": "DiagnosticOdometerId"
              },
          }
          
      }, function(odometer) {
        // output in KM and Miles
        var km = Math.round(odometer[0].data/1000);
        var miles= Math.round(km/1.609);
        document.getElementById("odometer").innerHTML="Current Odometer Reading:"+km+"KM/"+miles+"Miles";

        //source of the odometer
        if ((odometer[0].id)!=null){
          document.getElementById("source").innerHTML="Odometer Source: Engine"
        }

        else{
          document.getElementById("source").innerHTML="Odometer Source: GPS"
        }
      },);

      //Ignition data 
      api.call("Get", {
        "typeName": "StatusData",
        search:{
            "fromDate": now,
            "deviceSearch": {
                    "id": result[0].id
            },
            "diagnosticSearch": {
                    "id": "DiagnosticIgnitionId"
            },
        }
        
    }, function(ignition) {
      document.getElementById("ignition").innerHTML="Current Igntion status (1-on, 0-off):"+ignition[0].data;
     
    },);

    //Device Location
    api.call("Get", {
      "typeName": "DeviceStatusInfo", 
     "search":{ 
               "deviceSearch":{
                  "id":result[0].id
              }
     }, 
     }, function(location) { 
      document.getElementById("loc").innerHTML="Current Device Location:[latitude:"+location[0].latitude+","+"longitude:"+location[0].longitude+"]";
    },
     );

     
  api.call("Get", {
  "typeName": "Trip",
  "includeOverlappingTrips": true,
  search:{
          "deviceSearch": {
                  "id": result[0].id
          },
      }
  
}, function(result) {
  document.getElementById("trip").innerHTML="Last Trip Started Date:"+(result[result.length-1].start).slice(0,10)+",Time:"+(result[result.length-1].start).slice(11,19);
 
});


    }},
    //show the error function if the data doesn't load (could be due to network issue or wrong input)
    function(e) {
      alert("Failed to load the data");
    });

      }

    }
  }, (error) => {
  alert('Login Failed: Incorrect Credentials'); //show error if the credentials are wrong 
});

}










