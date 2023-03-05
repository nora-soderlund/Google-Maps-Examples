export default class MarkerBundle {
    colors = [ "#4385F5", "#DC4438", "#F5B401", "#109D59", "#F2F1F2" ];
    events = [ "mousedown", "mouseup", "click", "dblclick", "contextmenu" ];

    markers = [];
    images = [];

    hovered = -1;

    constructor(map, position, image) {
        this.map = map;
        this.position = position;
        this.image = image;

        this.marker = new google.maps.Marker({
            map: this.map,
            position: this.position
        });

        this.marker.addListener("mouseover", (event) => {
            this.mousemoveListener = this.map.addListener("mousemove", this.mousemove.bind(this));
        });

        this.marker.addListener("mouseout", (event) => {
            google.maps.event.removeListener(this.mousemoveListener);

            if(this.hovered !== -1) {
                this.hovered = -1;

                this.render();
            }
        });

        this.events.forEach((name) => {
            this.marker.addListener(name, (event) => {
                if(this.hovered !== -1) {
                    google.maps.event.trigger(this.markers[(this.markers.length - 1) - this.hovered], name, event);
                }
            });
        })

        this.render();
    };

    mousemove(event) {
        for(let index = 0; index < this.images.length; index++) {
            const alphaIndex = ((event.domEvent.offsetY * this.images[index].canvas.width + event.domEvent.offsetX) * 4) + 3;
            const alpha = this.images[index].imageData.data[alphaIndex];

            if(alpha < 254)
                continue;

            if(index != this.hovered) {
                this.hovered = index;
                
                google.maps.event.trigger(this.markers[(this.markers.length - 1) - this.hovered], "mouseover", event);

                this.render();
            }

            google.maps.event.trigger(this.markers[(this.markers.length - 1) - this.hovered], "mousemove", event);

            return;
        }

        if(this.hovered != -1) {
            google.maps.event.trigger(this.markers[(this.markers.length - 1) - this.hovered], "mouseout", event);

            this.hovered = -1;

            this.render();
        }
    };

    static getMarkerImage() {
        return new Promise((resolve, reject) => {
            const image = new Image();
    
            image.onload = () => resolve(image);
            image.onerror = () => reject();
    
            image.crossOrigin = "anonymous";
            image.src = "https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi3.png";
        });
    };

    addMarker(marker) {
        marker.setMap(null);

        this.markers.push(marker);

        this.images = [];

        for(let index = 0; index < this.markers.length; index++)
            this.images.push(this.renderMarker(index));

        this.render();
    };

    renderMarker(index) {
        const color = this.colors[(this.markers.length - 1) - index];
        const rotation = 45 - (index * (90 / (this.markers.length - 1)));

        const size = Math.max(this.image.width, this.image.height) * 2;

        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = this.image.height;
    
        const context = canvas.getContext("2d");
    
        context.translate(canvas.width / 2, canvas.height);
        context.rotate(rotation * Math.PI / 180);

        const left = -this.image.width / 2;
        const top = -this.image.height;
    
        context.drawImage(this.image, left, top, this.image.width, this.image.height);
    
        context.globalCompositeOperation = "color";
        context.fillStyle = color;
        context.fillRect(left, top, canvas.width, canvas.height);
    
        context.globalCompositeOperation = "destination-in";
        context.drawImage(this.image, left, top, this.image.width, this.image.height);

        context.setTransform(1, 0, 0, 1, 0, 0);

        return {
            canvas,
            imageData: context.getImageData(0, 0, canvas.width, canvas.height)
        };
    };

    render() {
        const size = Math.max(this.image.width, this.image.height) * 2;
        
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = this.image.height;
    
        const context = canvas.getContext("2d");
    
        this.images.forEach((image, index) => {
            if(this.hovered === index)
                return;

            context.drawImage(image.canvas, 0, 0);
        });

        if(this.hovered !== -1)
            context.drawImage(this.images[this.hovered].canvas, 0, 0);

        this.marker.setIcon({
            url: canvas.toDataURL(),
            anchor: new google.maps.Point(canvas.width / 2, canvas.height)
        });
    };
};
