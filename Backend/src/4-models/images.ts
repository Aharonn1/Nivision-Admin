class ImagesModel{

    imageId:number;
    imageName:string;

    constructor(image:ImagesModel){
        this.imageId = image.imageId;
        this.imageName = image.imageName
    }
}
export default ImagesModel