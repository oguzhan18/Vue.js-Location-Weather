const app = new Vue({
	el:'#app',
	data:{
		loading:true,
		lat:null,
		lon:null,
    location:null,
    today: {
      temp:null,
      temp_low:null,
      temp_high:null,
      icon:null,
    },
    week: [],
		images:{
			'clear-day':'wi-day-sunny',
      'clear-night':'wi-night-clear',
      'partly-cloudy-day':'wi-day-cloudy',
      'partly-cloudy-night':'wi-night-partly-cloudy',
      'rain':'wi-rain',
      'snow':'wi-snow',
      'sleet':'wi-sleet',
      'wind':'wi-strong-wind',
      'fog':'wi-fog',
      'cloudy':'wi-cloudy',
      'default':'wi-na'
		}
	},
	created() {
    navigator.geolocation.watchPosition(pos => {
      this.lat = pos.coords.latitude;
      this.lon = pos.coords.longitude;
      this.getLocation();
      this.loadWeather();
    },
    error => {
      if (error.code == error.PERMISSION_DENIED) {
        this.today.desc = 'Konumu yukardan izin ver.';
        this.loading = false;
      }
    });
	},
  computed:{
    timeOfDayClass() {
      var bg_color = null;
      
      var split_morning = 6; 
      var split_afternoon = 12; 
      var split_evening = 17; 
      var split_night = 22; 
      var current_hour = new Date().getHours(); 

      if(current_hour >= split_afternoon && current_hour < split_evening) {
        bg_color = 'afternoon'; 
      } else if(current_hour >= split_evening && current_hour < split_night) {
        bg_color = 'evening'; 
      } else if(current_hour >= split_night || current_hour < split_morning ) {
        bg_color = 'night'; 
      } else {
        bg_color = 'morning'; 
      }
      
      console.log('Good ' + bg_color + '!');
      return bg_color;
    }
  },
	methods:{
    getLocation(){
      $.ajax({
        url: `https://api.geocod.io/v1.3/reverse?q=${this.lat},${this.lon}&api_key=73c5cd7da4a5a381385575c1d02d7c74183c5c4`,
        dataType: 'JSON'
      })
      .done(res => {
        console.log('location',res);
        this.location = res.results[0].address_components.city + ', ' + res.results[0].address_components.state;
      })
      .fail(e => {
        console.error(e);
      });
    },
		loadWeather() {
      $.ajax({
        url: `https://api.darksky.net/forecast/3d2707e4079ea36c7ca9abe64fb850db/${this.lat},${this.lon}`,
        dataType: 'JSONP'
      })
      .done(res => {
        let weather = res;
        console.log('weather',res);
        this.today.temp = Math.round(weather.currently.temperature);
        this.today.temp_low = Math.round(weather.daily.data[0].temperatureLow);
        this.today.temp_high = Math.round(weather.daily.data[0].temperatureHigh);
        this.today.desc = 'Şuan: ' + weather.daily.data[0].summary;
        this.today.icon = weather.currently.icon;
        for(i=0; i < weather.daily.data.length; i++){
          this.week[i] = {
            'icon': weather.daily.data[i].icon,
            'temp_high': Math.round(weather.daily.data[i].temperatureHigh),
            'temp_low': Math.round(weather.daily.data[i].temperatureLow),
            'desc': weather.daily.data[i].summary,
            'time': moment.unix(weather.daily.data[i].time).format('ddd')
          }
        }
        this.loading = false;
      })
      .fail(e => {
        console.error(e);
      });
    },
    iconClass: function(icon) {
      return this.images[icon];
    }
	}
});