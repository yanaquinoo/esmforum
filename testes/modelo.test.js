const bd = require('../bd/bd_utils.js');
const modelo = require('../modelo.js');

beforeEach(() => {
  bd.reconfig('./bd/esmforum-teste.db');
  // limpa dados de todas as tabelas
  bd.exec('delete from perguntas', []);
  bd.exec('delete from respostas', []);
});

test('Testando banco de dados vazio', () => {
  expect(modelo.listar_perguntas().length).toBe(0);
});

test('Testando cadastro de três perguntas', () => {
  modelo.cadastrar_pergunta('1 + 1 = ?');
  modelo.cadastrar_pergunta('2 + 2 = ?');
  modelo.cadastrar_pergunta('3 + 3 = ?');
  const perguntas = modelo.listar_perguntas();
  expect(perguntas.length).toBe(3);
  expect(perguntas[0].texto).toBe('1 + 1 = ?');
  expect(perguntas[1].texto).toBe('2 + 2 = ?');
  expect(perguntas[2].num_respostas).toBe(0);
  expect(perguntas[1].id_pergunta).toBe(perguntas[2].id_pergunta - 1);
});

test('get_pergunta retorna objeto correto e retorna falsy para ID inexistente', () => {
  const id = modelo.cadastrar_pergunta('Pergunta única');
  const perg = modelo.get_pergunta(id);
  expect(perg).toBeDefined();
  expect(perg.id_pergunta).toBe(id);
  expect(perg.texto).toBe('Pergunta única');
  const inexistente = modelo.get_pergunta(9999);
  expect(inexistente).toBeFalsy();
});

test('cadastrar_resposta e get_respostas funcionam corretamente', () => {
  const idPerg = modelo.cadastrar_pergunta('Pergunta teste');
  const idResp1 = modelo.cadastrar_resposta(idPerg, 'Resposta 1');
  const idResp2 = modelo.cadastrar_resposta(idPerg, 'Resposta 2');
  expect(typeof idResp1).toBe('number');
  expect(typeof idResp2).toBe('number');

  const respostas = modelo.get_respostas(idPerg);
  expect(respostas.length).toBe(2);

  const textos = respostas.map(r => r.texto);
  expect(textos).toContain('Resposta 1');
  expect(textos).toContain('Resposta 2');

  respostas.forEach(r => {
    expect(r.id_pergunta).toBe(idPerg);
    expect(typeof r.id_resposta).toBe('number');
  });
});

test('get_respostas retorna array vazio para pergunta sem respostas', () => {
  const idPerg = modelo.cadastrar_pergunta('Sem respostas');
  const respostas = modelo.get_respostas(idPerg);
  expect(Array.isArray(respostas)).toBe(true);
  expect(respostas.length).toBe(0);
});

test('get_num_respostas reflete o número correto', () => {
  const idPerg = modelo.cadastrar_pergunta('Contar respostas');
  expect(modelo.get_num_respostas(idPerg)).toBe(0);
  modelo.cadastrar_resposta(idPerg, 'R1');
  modelo.cadastrar_resposta(idPerg, 'R2');
  expect(modelo.get_num_respostas(idPerg)).toBe(2);
});

test('get_respostas e get_num_respostas para pergunta inexistente retornam vazio/zero', () => {
  const respostas = modelo.get_respostas(123456);
  expect(Array.isArray(respostas)).toBe(true);
  expect(respostas.length).toBe(0);
  expect(modelo.get_num_respostas(123456)).toBe(0);
});

test('listar_perguntas inclui num_respostas correto após inserir respostas', () => {
  const idPerg = modelo.cadastrar_pergunta('Listar com respostas');
  modelo.cadastrar_resposta(idPerg, 'R1');
  modelo.cadastrar_resposta(idPerg, 'R2');
  const perguntas = modelo.listar_perguntas();
  const alvo = perguntas.find(p => p.id_pergunta === idPerg);
  expect(alvo).toBeDefined();
  expect(alvo.num_respostas).toBe(2);
});
