const mongoose = require('mongoose');
const aws = require('aws-sdk');
const fs = require('fs'); // lida com arquivos
const path = require('path');
// o promisify converte uma função que utiliza a forma antiga de callbacks
// para lidar com programção assíncrona que é o que o fs utiliza para a nova
// forma para poder utilizar async await 
const { promisify } = require('util'); 

const s3 = new aws.S3();

const PostSchema = new mongoose.Schema({
  name: String,
  size: Number,
  key: String, // nome gerado com o hash
  url: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// antes do arquivo ser salvo no banco, se ele não tiver uma url ele vai
// colocar uma url antes de salvar no banco
PostSchema.pre('save', function() {
  if (!this.url) {
    this.url = `${process.env.APP_URL}/files/${this.key}`
  }
});

PostSchema.pre('remove', function() {
  if (process.env.STORAGE_TYPE === 's3') {
    return s3.deleteObject({
      Bucket: 'uploadexample',
      Key: this.key
    }).promise();
  } else {
    return promisify(fs.unlink)(
      path.resolve(__dirname, '..', '..', 'tmp', 'uploads', this.key)
    );
  }
});

module.exports = mongoose.model('Post', PostSchema);