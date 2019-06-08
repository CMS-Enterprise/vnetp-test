import { Graph } from './graph';

describe('Graph', () => {
    it('should create an instance', () => {
      expect(new Graph({})).toBeTruthy();
    });

    it('should create a graph 1', () => {
        const obj = { name: 'Parent', childArray: [{name: 'Child1'}, {name: 'Child2'}]};

        const result = new Graph(obj);

        expect(result).toBeTruthy();
        expect(result.links.length).toBe(2);
        expect(result.nodes.length).toBe(3);

        expect(result.nodes.filter(n => n.name === 'Parent')).toBeTruthy();
        expect(result.nodes.filter(n => n.name === 'Child1')).toBeTruthy();
        expect(result.nodes.filter(n => n.name === 'Child2')).toBeTruthy();
    });

    it('graph should have all links and nodes 1', () => {
        const obj = { name: 'Parent', childArray: [{name: 'Child1'}, {name: 'Child2'}]};

        const result = new Graph(obj);

        expect(result.links.length).toBe(2);
        expect(result.nodes.length).toBe(3);

    });

    it('graph should have nodes with names 1', () => {
        const obj = { name: 'Parent', childArray: [{name: 'Child1'}, {name: 'Child2'}]};

        const result = new Graph(obj);

        expect(result.nodes.filter(n => n.name === 'Parent')).toBeTruthy();
        expect(result.nodes.filter(n => n.name === 'Child1')).toBeTruthy();
        expect(result.nodes.filter(n => n.name === 'Child2')).toBeTruthy();
    });
  });
