// Jogo da Forca

// Configuração dados de entrada e dados de saída para Node JS
const readline = require('readline');
 const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
 })

// Banco de palavras
const palavras = ["banana", "abacaxi", "uva", "morango", "laranja"];
 
console.log("Banco de palavras criado com sucesso!");

//Escolher uma palavra aleatória
const palavraSecreta = palavras[Math.floor(Math.random() * palavras.length)];

// Criar a palavra oculta com "_" 
let palavraOculta = Array(palavraSecreta.length).fill("_");

// Vamos definir um número de tentativas - Nesse caso, 6 porque representa o desenho de um corpo completo
let tentativas = 6;


function pedirChute(){
    console.log('Palavra:' +palavraOculta.join('')); 
    console.log(`Você tem ${tentativas} tentativas restantes.`);

    rl.question('Digite uma letra ou tente advinhar a palavra:', (chute) => {
        chute = chute.toLowerCase();

        // Verifica se o chute é válido
        if (chute === "" || chute === undefined) {
            console.log("Entrada inválida. Tente novamente.");
            pedirChute(); // Pede o chute novamente
        } else {
            verificarChute(chute); // Se o chute for válido, verifica o chute
        }
    })
}

//Agora vamos criar a função para fazer o chute
function verificarChute(chute){
    let acertou = false;

    if (chute.length > 1){
        if(chute === palavraSecreta){
            console.log(`Parabéns! Você acertou a palavra: ${palavraSecreta}`);
            return rl.close(); // Fecha a interface de leitura
        } else {
            tentativas--;
            console.log('Palavra errada!');
        }
    } else {
        // Se o chute for uma única letra, verifica na palavra secreta
        for(let i = 0; i < palavraSecreta.length; i++){ //banana
            if(palavraSecreta[i] === chute){
                palavraOculta[i] = chute;
                acertou = true;
            }
        }       

        if(!acertou){ 
            tentativas--;
            console.log('Letra incorreta!');
        } else {
            console.log('Boa palavra até agora:' +palavraOculta.join(' '));
        }
    }
    
    // Verifica se o jogo acabou
    if (palavraOculta.join("") === palavraSecreta) {
        console.log(`Parabéns! Você acertou a palavra: ${palavraSecreta}`);
        rl.close();
    } else if (tentativas > 0) {
        pedirChute(); // Continua o jogo pedindo um novo chute
    } else {
        console.log(`Game over! A palavra era: ${palavraSecreta}`);
        rl.close();
    }
}
    // Exibir a palavra oculta e o número de tentativas restantes
    console.log('Bem-vindo ao jogo da forca!');
    pedirChute();
