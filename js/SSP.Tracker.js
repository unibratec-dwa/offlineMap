var SSP = SSP || {};
SSP.Tracker = {
  _watcher: null,
  
  setUp: function() {
    
   
    var verificarStatus = SSP.delegate(this, this.verificarStatus);
    $(window).on("online offline", verificarStatus);
    this.verificarStatus();
  },
  
  
  verificarStatus: function() {
    if(navigator.onLine == true) {
        $("body").removeClass('offline');
      
        if(this.Mapa._objeto === null) {
          this.Mapa.loadScript();
        }  
      
      } else {
        $("body").addClass('offline');
      }
  },
  
  localizarPosicao: function() {
    
    var definirPosicao, erroPosicao, opcoesDoWatch;
    
    opcoesDoWatch = {
      enableHighAccuracy: true
    }
    
    definirPosicao = function(evento) {
      SSP.Tracker.definirPosicao(evento);
    }
    
    erroPosicao = function(evento) {
      SSP.Tracker.erroPosicao(evento);
    }    
    
    this._watcher = navigator
                      .geolocation
                      .watchPosition(definirPosicao, 
                                     erroPosicao, 
                                     opcoesDoWatch);
  },
  
  definirPosicao: function(evento) {
    this.Mapa.mover(evento.coords);
  },
  
  erroPosicao: function(evento) {
    console.log("Erro", evento);
  },
  
  Mapa: {
    
    _objeto: null,
    
    _idElementoHTML: "#mapa",
    
    _posicaoInicial: {
      latitude: -14.2400732, 
      longitude: -53.1805017
    },
    
    _zoomInicial: 3,
    _zoomPino: 17,
    
    setUp: function() {
      
    },
    
    loadScript: function() {
      var script = document.createElement('script');
      script.type = 'text/javascript';
      script.src= 'http://maps.googleapis.com/maps/api/js?key= AIzaSyBVlBk33EUCynlJKJI16yvvTjLNkZ6bbDc&sensor=true&callback=SSP.Tracker.Mapa.criar';
      
      document.body.appendChild(script);
    },
    
    gerarPosicao: function(posicao) {
       return new google.maps.LatLng(posicao.latitude, posicao.longitude);
    },
    
    criar: function() {
      var elementoHTML, opcoesDoMapa;
      
      elementoHTML = document.querySelector(this._idElementoHTML);
      
      opcoesDoMapa = {
        zoom: this._zoomInicial,
        center: this.gerarPosicao(this._posicaoInicial)
      }
      
      this._objeto = new google.maps.Map(elementoHTML, opcoesDoMapa);
      
      SSP.Tracker.localizarPosicao();
    }, 
    
    mover: function(coords) {
      var posicao = this.gerarPosicao(coords);
      
      this._objeto.panTo(posicao);
      
      this._objeto.setZoom(this._zoomPino);
      
      if(this.Pino._objeto === null) {
        this.Pino.criar(posicao);
      } else {
        this.Pino.mover(posicao);
      }
    },
    
    
    
    Pino: {
      
      _objeto: null,
      _infoWindow: null,
      _geocoder: null,
      _icone: "https://cdn2.iconfinder.com/data/icons/snipicons/500/map-marker-128.png",
      
      setUp: function() {
        
      },
     
      
      atualizarMarcador: function() {
        var geocodeOptions, geocodeRequestHandler;
        
        
        this._infoWindow.setContent("Carregando endereço...");
        
        
        geocodeOptions = {
          "latLng": this._objeto.getPosition()
        };
        
        geocodeRequestHandler = SSP.delegate(this, this.geocodeRequestHandler);
        
        this._geocoder.geocode(geocodeOptions, geocodeRequestHandler)
      
      },
      
      geocodeRequestHandler: function(results, status) {
        if(status == google.maps.GeocoderStatus.OK) {
          this._infoWindow.setContent(results[1].formatted_address);
        } 
      },
      
      
      abrirJanela: function() {
        this.atualizarMarcador();
        this._infoWindow.open(this.parent()._objeto, this._objeto);
      },
      
      criar: function(posicao) {
        
        var abrirJanela = SSP.delegate(this, this.abrirJanela);
        
        var opcoesDoMarcador = {
          position: posicao,
          map: SSP.Tracker.Mapa._objeto,
          icon: this._icone,
          animation: google.maps.Animation.DROP,
          title: 'Você está aqui'
        }
        
       this._objeto = new google.maps.Marker(opcoesDoMarcador);
        
        
       this._infoWindow = new google.maps.InfoWindow({
         content: "Content", 
         maxWidth: 700
       });
       
       
       this._geocoder = new google.maps.Geocoder();
        
       google.maps.event.addListener(this._objeto, "click", abrirJanela);
       
      },
      
      mover: function(posicao) {
        this._objeto.setPosition(posicao);
      }
    }
  }
}

SSP.init();